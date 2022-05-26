const express = require("express");
const router = express.Router();
router.use(express.json());
const multer = require("multer");

const path = require("path");
const productModel = require("../models/productModel");

// Static Folders
// router.use(express.static("public"));

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

module.exports = router;
