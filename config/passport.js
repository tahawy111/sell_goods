const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const AdminModel = require("../models/AdminModel");
const CartModel = require("../models/CartModel");
// Load admin model

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      (username, password, done) => {
        // Match Admin
        AdminModel.findOne({ username: username })
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: "هذا الحساب غير مسجل",
              });
            }

            // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "الباسورد خاطئ" });
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
    AdminModel.findById(id, (err, user) => {
      CartModel.findById(id)
        .then((cart) => {
          if (!cart) {
            return done(err, user);
          }
          user.cart = cart;
          return done(err, user);
        })
        .catch((err) => console.log(err));
    });
  });
};
