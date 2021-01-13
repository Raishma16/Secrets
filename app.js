require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/usersDB", { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if(err) console.log(err);
  else console.log("Successfully connected to usersDB");
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

/**************************** LOGIN APIs ****************************/

app.route("/login")

.get((req, res) => {
  res.render("login");
})

.post((req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, err => {
    if(err) console.log(err);
    else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  })
});

/**************************** REGISTER APIs ****************************/

app.route("/register")

.get((req, res) => {
  res.render("register");
})

.post((req, res) => {
  User.register({username: req.body.username}, req.body.password, (err, user) => {
    if(err) {
      console.log(err);
      res.redirect("/register");
    }
    else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });

});

app.get("/secrets", (req, res) => {
  if(req.isAuthenticated()) res.render("secrets");
  else res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
