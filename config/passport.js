const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
// Load admin model
const Admin = require("../models/Admins");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      (username, password, done) => {
        // Match Admin
        Admin.findOne({ username: username })
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: "That username is not registred! ",
              });
            }

            // Match Password
            bcrypt.compare()
          })
          .catch((err) => console.log(err));
      }
    )
  );
};
