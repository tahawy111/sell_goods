const express = require("express");
const router = express.Router();
const AdminModel = require("../models/AdminModel");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

// Admin routes

// creating admins
router.get("/create-admin", ensureAuthenticated, isAdmin, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  res.render("create-admin", {
    title: "Create Admin",
    admin: req.user,
    totalProducts,
  });
});
router.post("/create-admin", ensureAuthenticated, isAdmin, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  const { name, username, password, password2, comment, manageAdmins } =
    req.body;

  let errors = [];
  // Check required fields
  if (!name || !username || !password || !password2)
    errors.push({ msg: "Please Fill in all Feilds" });

  // Check password match
  if (password !== password2) errors.push({ msg: "passwords does not match" });

  // Check pass length
  if (password.length < 6)
    errors.push({ msg: "Password should be at least 6 characters" });

  if (errors.length > 0) {
    res.render("create-admin", {
      title: "Create Admin",
      admin: req.user,
      errors,
      name,
      username,
      password,
      password2,
      comment,
    });
  } else {
    // Validation Passed
    AdminModel.findOne({ username: username }).then((admin) => {
      if (admin) {
        // Admin exists
        errors.push({ msg: "Username is already registered" });
        res.render("create-admin", {
          title: "Create Admin",
          admin: req.user,
          errors,
          name,
          username,
          password,
          password2,
          comment,
        });
      } else {
        const newAdmin = new AdminModel({
          name: name,
          username: username,
          password: password,
          comment: comment,
          manageAdmins: manageAdmins,
        });

        // Hash password
        bcrypt
          .genSalt(10)
          .then((salt) => {
            return bcrypt.hash(newAdmin.password, salt);
          })
          .then((hash) => {
            // set password to hashed
            newAdmin.password = hash;

            // save admin to database
            newAdmin
              .save()
              .then(() => {
                req.flash("success_msg", "تمت اضافة المدير بنجاح");
                res.render("success-page", {
                  title: "Success",
                  admin: req.user,
                  success_title: "تمت اضافة المدير بنجاح",
                  btn_title: "أذهب الي الصفحة الرئيسية",
                  target: "_self",
                  btn_url: "/",
                  totalProducts,
                });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => {
            throw err;
          });
      }
    });
  }
});
//

// Login handle
router.get("/login", forwardAuthenticated, (req, res) => {
  res.render("login");
});

router.post("/login", forwardAuthenticated, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout handle
router.get("/logout", ensureAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

// Admins List
router.get("/admins-list", ensureAuthenticated, isAdmin, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  AdminModel.find()
    .then((result) => {
      res.render("admins-list", {
        title: "Admins List",
        data: result,
        admin: req.user,
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});

// Edit Admin
router.get("/edit-admin/:id", ensureAuthenticated, isAdmin, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  AdminModel.findById(req.params.id)
    .then((result) => {
      res.render("edit-admin", {
        title: "Edit Admin",
        data: result,
        admin: req.user,
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});

// Update Admin
router.post("/update-admin/:id", ensureAuthenticated, isAdmin, (req, res) => {
  if (req.body.manageAdmins === undefined) {
    req.body.manageAdmins = false;
  } else {
    req.body.manageAdmins = true;
  }
  // hash password
  let updatedData = {
    name: req.body.name,
    username: req.body.username,
    comment: req.body.comment,
    manageAdmins: req.body.manageAdmins,
  };
  if (req.body.password.length < 60) {
    bcrypt
      .genSalt(10)
      .then((salt) => {
        return bcrypt.hash(req.body.password, salt);
      })
      .then((hash) => {
        // set password to hashed
        updatedData.password = hash;
        AdminModel.findByIdAndUpdate(req.params.id, updatedData)
          .then(() => {
            res.redirect("/admins-list");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        throw err;
      });
  } else {
    AdminModel.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      comment: req.body.comment,
      manageAdmins: req.body.manageAdmins,
    })
      .then(() => {
        res.redirect("/admins-list");
      })
      .catch((err) => console.log(err));
  }
});

router.get("/delete-admin/:id", (req, res) => {
  AdminModel.findByIdAndRemove(req.params.id)
    .then(() => {
      res.redirect("/admins-list");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
