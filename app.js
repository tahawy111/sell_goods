const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
app.use(express.json());
app.set("view engine", "ejs");
const imagesModel = require("./models/imageModel");
const multer = require("multer");
const imageModel = require("./models/imageModel");

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
app.get("/", (req, res) => {
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

app.post("/add", upload, (req, res) => {
  const image = new imagesModel({
    name: req.body.name,
    image: req.file.filename,
  });
  image.save();
  res.redirect("/");
});

app.get("/add", (req, res) => {
  res.render("add", {
    title: "Add",
  });
});

// Static Folders
app.use(express.static("public"));

mongoose
  .connect(
    "mongodb+srv://admin:admin123456@cluster0.04rgz.mongodb.net/images?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((err) => console.log(err));
