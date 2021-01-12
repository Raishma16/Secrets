require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/usersDB", { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if(err) console.log(err);
  else console.log("Successfully connected to usersDB");
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

/**************************** LOGIN APIs ****************************/

app.route("/login")

.get((req, res) => {
  res.render("login");
})

.post((req, res) => {
  User.findOne({username: req.body.username}, (err, user) => {
    if(err) console.log(err);
    else {
      if(user) {
        bcrypt.compare(req.body.password, user.password, function(err, result) {
          if(result === true) res.render("secrets");
          else console.log("Invalid password");
        });
      }
      else console.log("Invalid username");
    }
  });
});

/**************************** REGISTER APIs ****************************/

app.route("/register")

.get((req, res) => {
  res.render("register");
})

.post((req, res) => {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    const user = new User({
      username: req.body.username,
      password: hash
    });

    user.save((err) => {
      if(err) console.log(err);
      else res.render("secrets");
    });
  });
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});
