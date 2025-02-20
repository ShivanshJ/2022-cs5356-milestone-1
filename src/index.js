const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 8080;

// CS5356 TODO #2

const serviceAccount = require("./../config/serviceAccountKey.json");
const userFeed = require("./app/user-feed");
const authMiddleware = require("./app/auth-middleware");

// CS5356 TODO #2
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://string-36db2-default-rtdb.firebaseio.com"
});

// use cookies
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static("static/"));

// use res.render to load up an ejs view file
// index page
app.get("/", function (req, res) {
  res.render("pages/index");
  // res.redirect("/sign-in")
});

app.get("/sign-in", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/sign-up", function (req, res) {
  res.render("pages/sign-in");
});

app.get("/dashboard", authMiddleware, async function (req, res) {
  const feed = await userFeed.get();
  res.render("pages/dashboard", { user: req.user, feed });
});

app.post("/sessionLogin", async (req, res) => {
  // CS5356 TODO #4

  console.log(req.body)
  if (req.body){
    const idToken = req.body.idToken.toString();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // Set session expiration to 5 days.
    admin
      .auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
        (sessionCookie) => {
          // Set cookie policy for session cookie.
          const options = { maxAge: expiresIn, httpOnly: true, secure: true };
          res.cookie('session', sessionCookie, options);
          res.status(200).send(JSON.stringify({ status: 'success' }));
        },
        (error) => {
          res.status(401).send('UNAUTHORIZED REQUEST!');
        }
      );

  } else {
    res.status(501).send();
  }
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/sign-in");
});

app.post("/dog-messages", authMiddleware, async (req, res) => {
  // CS5356 TODO #5
  user = {
    'email': req.user.email, 
  }
  message = req.body.message
  userFeed.add(user, message)
  res.redirect('/dashboard');
  // res.status(200).send({status: 'Success'})
});

app.listen(port);
console.log("Server started at http://localhost:" + port);
