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
          .then((admin) => {
            if (!admin) {
              return done(null, false, {
                message: "That username is not registred! ",
              });
            }

            // Match Password
            bcrypt.compare(password, admin.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Password incorrect" });
              }
            });
            // .then((isMatch) => {
            //   if (isMatch) {
            //     return done(null, user);
            //   } else {
            //     return done(null, false, { message: "Password incorrect" });
            //   }
            // })
            // .catch((err) => {
            //   throw err;
            // });
          })
          .catch((err) => console.log(err));
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
