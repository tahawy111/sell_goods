const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Admins = require("../models/Admins");
// Load admin model

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      (username, password, done) => {
        // Match Admin
        Admins.findOne({ username: username })
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: "That username is not registred! ",
              });
            }

            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Password incorrect" });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    )
  );
  passport.serializeUser((admin, done) => {
    done(null, admin.id);
  });

  passport.deserializeUser((id, done) => {
    Admins.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
