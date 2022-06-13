const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/CategoryModel");
const RecoverBillModel = require("../models/RecoverBillModel");
const RecoverBillListModel = require("../models/RecoverBillListModel");
const mongoose = require("mongoose");

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
    dealerPrice: req.body.dealerPrice,
    wholesale: req.body.wholesale,
    quantity: req.body.quantity,
    barcode: req.body.barcode,
    category: req.body.category,
    image: req.file ? req.file.filename : "No Data",
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
      res.render("add", {
        title: "Add",
        category: doc,
        admin: req.user,
        totalProducts,
      });
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
    dealerPrice: req.body.dealerPrice,
    wholesale: req.body.wholesale,
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
      if (req.file) {
        fs.unlinkSync(`./public/uploads/images/${result.image}`);
        res.redirect("/");
      } else {
        res.redirect("/");
      }
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
      { quantity: { $lte: req.query.quantity } },
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
    title: "انشاء باركود A4",
    admin: req.user,
    totalProducts,
  });
});
router.get("/create-barcode-a5", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("create-barcode-a5", {
    title: "انشاء باركود A5",
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
router.get("/delete-category", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  CategoryModel.find().then((result) => {
    res.render("delete-category", {
      title: "انشاء فئة",
      admin: req.user,
      totalProducts,
      category: result,
    });
  });
});

router.get("/delete-category", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  CategoryModel.find().then((result) => {
    res.render("delete-category", {
      title: "انشاء فئة",
      admin: req.user,
      totalProducts,
      category: result,
    });
  });
});

router.post("/delete-category", ensureAuthenticated, (req, res) => {
  CategoryModel.findOneAndDelete({ category: req.body.category })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
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

router.get("/system-data", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  let totalDealer = 0;
  let total = 0;
  let totalwholesale = 0;

  ProductModel.find().then((result) => {
    result.forEach((ele) => {
      const totalQ = ele.price * ele.quantity;
      const totalDealerQ = ele.dealerPrice * ele.quantity;
      const totalwholesaleQ = ele.wholesale * ele.quantity;

      totalDealer += totalDealerQ;
      total += totalQ;
      totalwholesale += totalwholesaleQ;
    });

    res.render("system-data", {
      title: "معلومات السيستم",
      admin: req.user,
      totalProducts,
      totalDealer,
      total,
      totalwholesale,
    });
  });
});

router.get("/print-products", ensureAuthenticated, (req, res) => {
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
            res.render("print-products", {
              title: "طباعة المنتجات",
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
            res.render("print-products", {
              title: "طباعة المنتجات",
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

router.get("/create-recover-bill", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  RecoverBillModel.find().then((result) => {
    res.render("create-recover-bill", {
      title: "انشاء فاتورة مرتجعات",
      admin: req.user,
      totalProducts,
      data: result,
    });
  });
});

router.post("/recover/add", ensureAuthenticated, (req, res) => {
  const { name } = req.body;
  const price = +req.body.price;
  const quantity = +req.body.quantity;
  const totalPrice = price * quantity;
  let total = totalPrice;
  // const oid = mongoose.Types.ObjectId();

  const newProduct = {
    name,
    price,
    quantity,
    totalPrice,
  };

  const newRecoverBill = new RecoverBillModel(newProduct);

  newRecoverBill
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/create-recover-bill");
    })
    .catch((err) => console.log(err));
});
router.get("/edit-recover-bill/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  RecoverBillModel.findById(req.params.id).then((result) => {
    res.render("edit-recover-bill", {
      title: "تعديل فاتورة مرتجعات",
      admin: req.user,
      totalProducts,
      data: result,
    });
  });
});
router.get("/delete-recover-bill/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  RecoverBillModel.findByIdAndRemove(req.params.id).then((result) => {
    res.redirect("/create-recover-bill");
  });
});
router.post("/update-recover-bill/:id", ensureAuthenticated, (req, res) => {
  const { name } = req.body;
  const price = +req.body.price;
  const quantity = +req.body.quantity;
  const totalPrice = price * quantity;

  RecoverBillModel.findByIdAndUpdate(req.params.id, {
    name,
    price,
    quantity,
    totalPrice,
  }).then((result) => {
    res.redirect("/create-recover-bill");
  });
});

router.get("/recover-bill/create", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  RecoverBillModel.find().then((result) => {
    let total = 0;
    let totalQuantity = 0;
    result.forEach((ele) => {
      total += ele.totalPrice;
      totalQuantity += ele.quantity;
    });

    const newRecoverBillList = new RecoverBillListModel({
      createdBy: req.user.name,
      recoverBillData: [...result],
      total,
      totalQuantity,
    });

    newRecoverBillList.save().then((result) => {
      RecoverBillModel.remove()
        .then((result) => {})
        .catch((err) => console.log(err));
      res.render("success-page", {
        title: "تمت اضافة فاتورة مرتجعات",
        admin: req.user,
        success_title: "تمت اضافة فاتورة المرتجعات بنجاح",
        btn_title: "طباعة الفاتورة",
        target: "_self",
        btn_url: `/recover-bill/print/${result._id}`,
        totalProducts,
      });
    });
  });
});
router.get("/recover-bill/print/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  RecoverBillListModel.findById(req.params.id)
    .then((result) => {
      res.render("recover-bill-print", {
        title: "فاتورة مرتجعات",
        admin: req.user,
        totalProducts,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/recover-bill-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  RecoverBillListModel.find(req.params.id)
    .then((result) => {
      res.render("recover-bill-list", {
        title: "قائمة فواتير المرتجعات",
        admin: req.user,
        totalProducts,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});
router.get("/recover-bill/delete/:id", ensureAuthenticated, (req, res) => {
  RecoverBillListModel.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.redirect("/recover-bill-list");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
