const express = require("express");
const router = express.Router();
const UserDealerModel = require("../models/UserDealerModel");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

router.get("/add-user-dealer", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  res.render("add-user-dealer", {
    title: "اضافة عميل جملة",

    admin: req.user,
    totalProducts,
  });
});

router.post("/add-user-dealer", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  const newUserDealer = new UserDealerModel(req.body);

  newUserDealer
    .save()
    .then(() => {
      res.render("success-page", {
        title: "تم اضافة العميل الديلر",
        admin: req.user,
        success_title: "تم اضافة العميل الديلر",
        btn_title: "اذهب الي الصفحة الرئيسية",
        btn_url: `/`,
        target: "_self",
        totalProducts,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/user-dealer-list", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  UserDealerModel.find().then((result) => {
    res.render("user-dealer-list", {
      title: "قائمة العملاء الجملة",
      admin: req.user,
      totalProducts,
      data: result,
    });
  });
});

router.get(
  "/user-dealer-list/delete-user-dealer/:id",
  ensureAuthenticated,
  (req, res) => {
    UserDealerModel.findByIdAndDelete(req.params.id)
      .then((result) => {
        res.redirect("/user-dealer-list");
      })
      .catch((err) => console.log(err));
  }
);
router.get(
  "/user-dealer-list/edit-user-dealer/:id",
  ensureAuthenticated,
  (req, res) => {
    let totalProducts = null;

    if (!req.user.cart) {
      totalProducts = "";
    } else {
      totalProducts = req.user.cart.totalQuantity;
    }

    UserDealerModel.findById(req.params.id).then((result) => {
      res.render("edit-user-dealer", {
        title: "تعديل العميل الجملة",
        admin: req.user,
        totalProducts,
        data: result,
      });
    });
  }
);

router.post(
  "/user-dealer-list/edit-user-dealer/:id",
  ensureAuthenticated,
  (req, res) => {
    UserDealerModel.findByIdAndUpdate(req.params.id, req.body)
      .then((result) => {
        res.redirect("/user-dealer-list");
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
