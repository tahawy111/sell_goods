const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const productModel = require("../models/productModel");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

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
router.get("/", ensureAuthenticated, (req, res) => {
  productModel
    .find()
    .then((result) => {
      res.render("index", {
        title: "Home",
        data: result,
        admin: req.user,
      });
    })
    .catch((err) => console.log(err));
});

router.post("/add", ensureAuthenticated, upload, (req, res) => {
  const image = new productModel({
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    image: req.file.filename,
  });
  image.save();
  res.redirect("/");
});

router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("add", {
    title: "Add",
    admin: req.user,
  });
});

router.get("/details/:id", ensureAuthenticated, (req, res) => {
  productModel
    .findById(req.params.id)
    .then((result) => {
      res.render("details", {
        title: "Details",
        data: result,
        admin: req.user,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  productModel
    .findById(req.params.id)
    .then((result) => {
      res.render("edit", {
        title: "Edit",
        data: result,
        admin: req.user,
      });
    })
    .catch((err) => console.log(err));
});

router.post("/update/:id", ensureAuthenticated, upload, (req, res) => {
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

router.get("/delete/:id", ensureAuthenticated, (req, res) => {
  productModel
    .findByIdAndRemove(req.params.id)
    .then((result) => {
      // remove image from storage place
      fs.unlinkSync(`./public/uploads/images/${result.image}`);
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

router.get("/search", ensureAuthenticated, (req, res) => {
  // so now we will get input value from query parameters like "?search=amer"
  productModel
    .find({
      $or: [{ name: { $regex: req.query.name, $options: "i" } }],
    })
    .then((result) => {
      res.render("search-result", {
        title: "Search Result",
        data: result,
        admin: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/full-search", ensureAuthenticated, (req, res) => {
  res.render("full-search", {
    title: "Search",
    admin: req.user,
  });
});

router.get("/full-search-result", ensureAuthenticated, (req, res) => {
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
        admin: req.user,
      });
    });
});

router.get("/not_found", ensureAuthenticated, (req, res) => {
  res.render("404");
});

module.exports = router;