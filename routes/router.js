const express = require("express");
const router = express.Router();
router.use(express.json());
const multer = require("multer");
const fs = require("fs");
const productModel = require("../models/productModel");
const Admins = require("../models/Admins");
const bcrypt = require("bcryptjs");

// image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/images");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single("image");

// routes
router.get("/", (req, res) => {
  productModel
    .find()
    .then((result) => {
      res.render("index", {
        title: "Home",
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.post("/add", upload, (req, res) => {
  const image = new productModel({
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    image: req.file.filename,
  });
  image.save();
  res.redirect("/");
});

router.get("/add", (req, res) => {
  res.render("add", {
    title: "Add",
  });
});

router.get("/details/:id", (req, res) => {
  productModel
    .findById(req.params.id)
    .then((result) => {
      res.render("details", {
        title: "Details",
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/edit/:id", (req, res) => {
  productModel
    .findById(req.params.id)
    .then((result) => {
      res.render("edit", {
        title: "Edit",
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.post("/update/:id", upload, (req, res) => {
  let new_image;

  // prepere the files: delete the old from storage place & add the new to from storage place
  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync(`./public/uploads/images/${req.body.old_image}`);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  // here we added the new data
  productModel
    .findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      image: new_image,
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

router.get("/delete/:id", (req, res) => {
  productModel
    .findByIdAndRemove(req.params.id)
    .then((result) => {
      // remove image from storage place
      fs.unlinkSync(`./public/uploads/images/${result.image}`);
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

router.get("/search", (req, res) => {
  // so now we will get input value from query parameters like "?search=amer"
  productModel
    .find({
      $or: [{ name: { $regex: req.query.name, $options: "i" } }],
    })
    .then((result) => {
      res.render("search-result", {
        title: "Search Result",
        data: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/full-search", (req, res) => {
  res.render("full-search", {
    title: "Search",
  });
});

router.get("/full-search-result", (req, res) => {
  productModel
    .find({
      // here i am searching with two parameters & if i want to add more i can do it easily
      $or: [
        { name: req.query.name },
        { price: req.query.price },
        { quantity: req.query.quantity },
      ],
    })
    .then((result) => {
      res.render("full-search-result", {
        title: "Full Search Result",
        data: result,
      });
    });
});

router.get("/not_found", (req, res) => {
  res.render("404");
});

// user routes

router.post("/login", (req, res) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});
//

// creating admins
router.get("/create-admin", (req, res) => {
  res.render("create-admin", {
    title: "Create Admin",
  });
});
router.post("/create-admin", (req, res) => {
  const { name, username, password, password2, comment } = req.body;
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
      errors,
      name,
      username,
      password,
      password2,
      comment,
    });
  } else {
    // Validation Passed
    Admins.findOne({ username: username }).then((admin) => {
      if (admin) {
        // Admin exists
        errors.push({ msg: "Username is already registered" });
        res.render("create-admin", {
          title: "Create Admin",
          errors,
          name,
          username,
          password,
          password2,
          comment,
        });
      } else {
        const newAdmin = new Admins({
          name: name,
          username: username,
          password: password,
          comment: comment,
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
                req.flash(
                  "success_msg",
                  "Manager has been registered successfully"
                );
                res.render("success-page", {
                  title: "Success",
                  success_title: "Manager has been registered successfully",
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
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  pass;
});

module.exports = router;
