const express = require("express");
const router = express.Router();
router.use(express.json());
const multer = require("multer");
const imageModel = require("../models/imageModel");
const path = require("path");

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
  imageModel
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
  const image = new imageModel({
    name: req.body.name,
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
  imageModel.findById(req.body.id).then((result) => {
    res.render("details", {
      title: "Add",
    });
  });
});

module.exports = router;
