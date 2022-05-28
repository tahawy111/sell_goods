const express = require("express");
const router = express.Router();
router.use(express.json());
const multer = require("multer");
const fs = require("fs");
const productModel = require("../models/productModel");

// Pagination
// const index = (req, res, next) => {
//   if (req.query.page && req.query.limit) {
//     productModel
//       .paginate({}, { page: req.query.page, limit: req.query.limit })
//       .then((response) => {
//         res.json({ response });
//       })
//       .catch((err) => console.log(err));
//   } else {
//     return null;
//   }
// };

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
      res.render("search_result", {
        title: "Search Result",
        data: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/full_search", (req, res) => {
  res.render("full_search", {
    title: "Search",
  });
});

router.get("/full_search_result", (req, res) => {
  productModel
    .find({
      // here i am searching with two parameters & if i want to add more i can do it easily
      $or: [
        { name: { $regex: req.query.name, $options: "i" } },
        { price: req.query.price },
      ],
    })
    .then((result) => {
      res.render("full_search_result", {
        title: "Full Search Result",
        data: result,
      });
      console.log(result);
    });
});

router.get("/not_found", (req, res) => {
  res.render("404");
});

module.exports = router;
