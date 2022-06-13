const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const BillModel = require("../models/BillModel");
const PullMoneyModel = require("../models/PullMoneyModel");
const CloseAccountModel = require("../models/CloseAccountModel");
const ComplaintModel = require("../models/ComplaintModel");
const ProductModel = require("../models/productModel");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

// file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/files");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).single("file");

router.get("/bills-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  BillModel.find()
    .then((doc) => {
      res.render("bills-list", {
        title: "قائمة الفواتير",
        totalProducts,
        admin: req.user,
        data: doc,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/bills-list/print/:id", ensureAuthenticated, (req, res) => {
  BillModel.findById(req.params.id)
    .then((doc) => {
      res.render("bill", {
        title: "فاتورة مبيعات",
        admin: req.user,
        data: doc,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/bills-list/recover/:id", ensureAuthenticated, (req, res) => {
  BillModel.findById(req.params.id)
    .then((result) => {
      result.selectedProduct.forEach((bill) => {
        ProductModel.findById(bill._id)
          .then((product) => {
            product.quantity = +product.quantity + +bill.quantity;

            ProductModel.findByIdAndUpdate(bill._id, {
              quantity: product.quantity,
            }).then((result) => {});
          })
          .catch((err) => console.log(err));

        BillModel.findByIdAndRemove(req.params.id)
          .then(() => {
            res.redirect("/");
          })
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => console.log(err));
});

router.get("/bills-list/bill-search-result", (req, res) => {
  const { search } = req.query;
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  BillModel.findOne({ billNumber: search })
    .then((result) => {
      res.render("bill-search-result", {
        title: "ناتج البحث برقم الفاتورة",
        admin: req.user,
        totalProducts,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/search-for-bills", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("search-for-bills", {
    title: "البحث عن الفواتير",
    admin: req.user,
    totalProducts,
  });
});

router.get("/search-for-bills-result", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  const IsoSDate = new Date(req.query.sDate);
  const IsoEDate = new Date(req.query.eDate);

  BillModel.find({
    createdAt: { $lte: IsoEDate, $gte: IsoSDate },
  })
    .then((result) => {
      res.render("search-for-bills-result", {
        title: "ناتج البحث عن الفواتير بالتاريخ",
        admin: req.user,
        totalProducts,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/close-account-daily", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  let total = 0;
  let totalPull = 0;
  let date = new Date();

  // for searching by today's date
  let d = new Date();
  d.setHours(0, 0, 0, 0);

  let endOfDayDate = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59
  );
  // get week days in array
  const weekDays = [
    "السبت",
    "الاحد",
    "الاثنين",
    "الثلاث",
    "الاربع",
    "الخميس",
    "الجمعة",
  ];

  // get today's date
  const dateOfToday = date.toLocaleDateString("ar-EG");

  // get yaeserday time stamp date
  function getYesterdayDate() {
    let d = new Date();
    d.setHours(23, 59, 59);
    return new Date(d.getTime() - 22 * 60 * 60 * 1000);
  }
  console.log(getYesterdayDate());

  CloseAccountModel.findOne({
    $or: [
      { createdAt: { $lte: getYesterdayDate() } },
      { updatedAt: { $lte: getYesterdayDate() } },
    ],
  })
    .then((result) => {
      let oldAmount = 0;
      if (result) {
        oldAmount = result.totalAmount;
      } else {
        oldAmount = 0;
      }

      PullMoneyModel.find({
        createdAt: { $gte: d, $lte: endOfDayDate },
      })
        .then((result) => {
          result.forEach((item) => {
            totalPull += item.amount;
          });

          BillModel.find({
            createdAt: { $gte: d, $lte: endOfDayDate },
          }).then((ele) => {
            ele.forEach((item) => {
              total += item.totalPrice;
            });
            res.render("close-account-daily", {
              title: "تقفيل الحساب يوميا",
              admin: req.user,
              totalProducts,
              totalBill: total,
              weekDays: weekDays[date.getDay() + 1],
              totalPull,
              dateOfToday,
              oldAmount,
            });
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});
router.post("/close-account-daily", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  const { weekDay, dateOfToday } = req.body;
  const oldAmount = +req.body.oldAmount;
  const totalPull = +req.body.totalPull;
  const addedMoney = +req.body.addedMoney;
  const totalBill = +req.body.totalBill;
  const shop = +req.body.shop;
  const name = req.user.name;

  const totalAmount = totalBill + addedMoney - totalPull - shop;

  const newCloseAccount = new CloseAccountModel({
    name,
    weekDay,
    dateOfToday,
    oldAmount,
    totalPull,
    addedMoney,
    totalBill,
    totalAmount,
    shop,
  });

  newCloseAccount
    .save()
    .then((result) => {
      res.render("success-page", {
        title: "تم تقفيل الحساب اليومي بنجاح",
        admin: req.user,
        success_title: "تم تقفيل الحساب اليومي بنجاح",
        btn_title: "اذهب الي الصفحة الرئيسية",
        btn_url: `/`,
        target: "_self",
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/daily-accounts-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  let total = 0;
  CloseAccountModel.find().then((result) => {
    result.forEach((item) => {
      total += item.totalAmount;
    });
    res.render("daily-accounts-list", {
      title: "قائمة الحسابات اليومية",
      admin: req.user,
      totalProducts,
      data: result,
      totalAmount: total,
    });
  });
});

router.get("/monthly-accounts-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  const now = new Date();
  // get the first day of the current mounth
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  // get the last day of the current mounth
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  let total = 0;

  CloseAccountModel.find({
    $or: [
      { createdAt: { $gte: firstDay, $lte: lastDay } },
      { updatedAt: { $gte: firstDay, $lte: lastDay } },
    ],
  }).then((result) => {
    result.forEach((item) => {
      total += item.totalAmount;
    });

    res.render("monthly-accounts-list", {
      title: "قائمة الحسابات الشهرية",
      admin: req.user,
      totalProducts,
      data: result,
      totalAmount: total,
    });
  });
});
router.get("/search-for-closing-account", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("search-for-closing-account", {
    title: "قائمة الحسابات الشهرية",
    admin: req.user,
    totalProducts,
  });
});
router.get(
  "/search-for-closing-account-result",
  ensureAuthenticated,
  (req, res) => {
    let totalProducts = null;

    if (!req.user.cart) {
      totalProducts = "";
    } else {
      totalProducts = req.user.cart.totalQuantity;
    }

    const IsoSDate = new Date(req.query.sDate);
    const IsoEDate = new Date(req.query.eDate);

    let total = 0;

    CloseAccountModel.find({
      $or: [
        { createdAt: { $lte: IsoEDate, $gte: IsoSDate } },
        { updatedAt: { $lte: IsoEDate, $gte: IsoSDate } },
      ],
    })
      .then((result) => {
        result.forEach((item) => {
          total += item.totalAmount;
        });
        res.render("search-for-closing-account-result", {
          title: "قائمة الحسابات الشهرية",
          admin: req.user,
          totalProducts,
          data: result,
          totalAmount: total,
        });
      })
      .catch((err) => console.log(err));
  }
);

router.get("/edit-daily-account/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  CloseAccountModel.findById(req.params.id).then((result) => {
    res.render("edit-daily-account", {
      title: "تعديل الحساب اليومي",
      admin: req.user,
      totalProducts,
      data: result,
    });
  });
});
router.post("/close-account-daily/:id", ensureAuthenticated, (req, res) => {
  CloseAccountModel.findByIdAndUpdate(req.params.id, req.body).then(
    (result) => {
      res.redirect("/daily-accounts-list");
    }
  );
});
router.get("/delete-daily-account/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }
  CloseAccountModel.findByIdAndRemove(req.params.id).then((result) => {
    res.redirect("/daily-accounts-list");
  });
});

router.get("/pull-Money", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("pull-money", {
    title: "عملية سحب فلوس",
    admin: req.user,
    totalProducts,
  });
});

router.post("/pull-Money", ensureAuthenticated, upload, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  const pullMoney = new PullMoneyModel({
    name: req.body.name,
    amount: req.body.amount,
    why: req.body.why,
    file: req.file ? req.file.filename : "No Data",
  });

  pullMoney
    .save()
    .then((result) => {
      res.render("success-page", {
        title: "تمت اضافة عملية سحب الفلوس",
        admin: req.user,
        success_title: "تمت اضافة عملية سحب الفلوس",
        btn_title: "اذهب الي الصفحة الرئيسية",
        btn_url: `/`,
        target: "_self",
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/pull-Money-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  PullMoneyModel.find()
    .then((result) => {
      res.render("pull-Money-list", {
        title: "عملية سحب فلوس",
        admin: req.user,
        totalProducts,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});
router.get("/delete-pull-money/:id", ensureAuthenticated, (req, res) => {
  PullMoneyModel.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.redirect("/pull-Money-list");
    })
    .catch((err) => console.log(err));
});

router.get("/add-complaint", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("add-complaint", {
    title: "اضافة شكوي",
    admin: req.user,
    totalProducts,
  });
});
router.post("/add-complaint", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  if (req.body.solved === undefined) {
    req.body.solved = false;
  } else {
    req.body.solved = true;
  }

  const complaint = new ComplaintModel(req.body);

  complaint
    .save()
    .then(() => {
      res.render("success-page", {
        title: "شكوي",
        admin: req.user,
        success_title: "تمت اضافة الشكوي بنجاح",
        btn_title: "اذهب الي قائمة الشكاوي",
        btn_url: `/complaints-list`,
        target: "_self",
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});
router.get("/complaints-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  ComplaintModel.find()
    .then((result) => {
      res.render("complaints-list", {
        title: "فائمة الشكاوي",
        admin: req.user,
        totalProducts,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});
router.get("/complaints/edit/:id", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  ComplaintModel.findById(req.params.id)
    .then((result) => {
      res.render("edit-complaint", {
        title: "تحديث شكوي",
        admin: req.user,
        totalProducts,
        data: result,
      });
    })
    .catch((err) => console.log(err));
});
router.post("/edit-complaint/:id", ensureAuthenticated, isAdmin, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  if (req.body.solved === undefined) {
    req.body.solved = false;
  } else {
    req.body.solved = true;
  }

  ComplaintModel.findByIdAndUpdate(req.params.id, req.body)
    .then((result) => {
      res.redirect("/complaints-list");
    })
    .catch((err) => console.log(err));
});
router.get(
  "/complaints/delete/:id",
  ensureAuthenticated,
  isAdmin,
  (req, res) => {
    ComplaintModel.findByIdAndRemove(req.params.id)
      .then((result) => {
        res.redirect("/complaints-list");
      })
      .catch((err) => console.log(err));
  }
);

router.get("/user-dealer-list/bills/:id", ensureAuthenticated, (req, res) => {
  const { id } = req.params;

  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  BillModel.find({ "userDealer.dealerUserId": id }).then((result) => {
    console.log(result);
    res.render("user-dealer-bills", {
      title: "قائمة الفواتير",
      totalProducts,
      admin: req.user,
      data: result,
    });
  });
});

module.exports = router;
