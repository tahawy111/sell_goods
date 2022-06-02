const express = require("express");
const passport = require("passport");
const app = express();
// Passport Config
require("./config/passport")(passport);
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
app.set("view engine", "ejs");
const flash = require("connect-flash");
const session = require("express-session");

// Static Folders
app.use(express.static("public"));

// BodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Express Session
app.use(
  session({
    secret: "mmbkjmgstel 56756245ff kgjlo[few@75449.clhl.d",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

require("./routes")(app);

mongoose
  .connect(
    "mongodb+srv://admin:admin123456@cluster0.04rgz.mongodb.net/images?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => console.log(err));

// Server
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
