const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const ProductModel = require("../models/ProductModel");
const CategoryModel = require("../models/CategoryModel");

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
  let totalProducts = null;
  const { category } = req.query;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  if (category && category != "الكل") {
    CategoryModel.find()
      .then((doc) => {
        ProductModel.find({ category })
          .then((result) => {
            res.render("index", {
              title: "Home",
              data: result,
              category: doc,
              admin: req.user,
              totalProducts,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  } else {
    CategoryModel.find()
      .then((doc) => {
        ProductModel.find()
          .then((result) => {
            res.render("index", {
              title: "Home",
              data: result,
              category: doc,
              admin: req.user,
              totalProducts,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
});

router.post("/add", ensureAuthenticated, upload, (req, res) => {
  const product = new ProductModel({
    name: req.body.name,
    price: req.body.price,
    dellerPrice: req.body.dellerPrice,
    quantity: req.body.quantity,
    barcode: req.body.barcode,
    category: req.body.category,
    image: req.file.filename,
  });
  product.save();
  res.redirect("/");
});

router.get("/add", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  CategoryModel.find()
    .then((doc) => {
      res
        .render("add", {
          title: "Add",
          category: doc,
          admin: req.user,
          totalProducts,
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.get("/details/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  ProductModel.findById(req.params.id)
    .then((result) => {
      res.render("details", {
        title: "Details",
        data: result,
        admin: req.user,
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  CategoryModel.find()
    .then((doc) => {
      ProductModel.findById(req.params.id)
        .then((result) => {
          res.render("edit", {
            title: "Edit",
            data: result,
            admin: req.user,
            totalProducts,
            category: doc,
          });
        })
        .catch((err) => console.log(err));
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
  ProductModel.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    price: req.body.price,
    dellerPrice: req.body.dellerPrice,
    quantity: req.body.quantity,
    barcode: req.body.barcode,
    category: req.body.category,
    image: new_image,
  })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

router.get("/delete/:id", ensureAuthenticated, (req, res) => {
  ProductModel.findByIdAndRemove(req.params.id)
    .then((result) => {
      // remove image from storage place
      fs.unlinkSync(`./public/uploads/images/${result.image}`);
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

router.get("/search", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  // so now we will get input value from query parameters like "?search=amer"
  ProductModel.find({
    $or: [{ name: { $regex: req.query.name, $options: "i" } }],
  })
    .then((result) => {
      res.render("search-result", {
        title: "Search Result",
        data: result,
        admin: req.user,
        totalProducts,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/full-search", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  res.render("full-search", {
    title: "Search",
    admin: req.user,
    totalProducts,
  });
});

router.get("/full-search-result", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  ProductModel.find({
    // here i am searching with two parameters & if i want to add more i can do it easily
    $or: [
      { name: req.query.name },
      { price: req.query.price },
      { quantity: req.query.quantity },
    ],
  }).then((result) => {
    res.render("full-search-result", {
      title: "ناتج البحث الكامل",
      data: result,
      admin: req.user,
      totalProducts,
    });
  });
});

router.get("/not_found", ensureAuthenticated, (req, res) => {
  res.render("404");
});

router.get("/search-by-barcode", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  res.render("search-by-barcode", {
    title: "البحث بالباركود",
    admin: req.user,
    totalProducts,
  });
});

router.get("/details2/:barcode", ensureAuthenticated, (req, res) => {
  const barcode = +req.params.barcode;

  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  ProductModel.findOne({ barcode: barcode })
    .then((result) => {
      res.render("details", {
        title: "Details",
        data: result,
        admin: req.user,
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/create-barcode", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("create-barcode", {
    title: "انشاء باركود",
    admin: req.user,
    totalProducts,
  });
});

router.get("/create-category", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("create-category", {
    title: "انشاء فئة",
    admin: req.user,
    totalProducts,
  });
});
router.post("/create-category", ensureAuthenticated, (req, res) => {
  const newCategory = new CategoryModel(req.body);
  newCategory
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
