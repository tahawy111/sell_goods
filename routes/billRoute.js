const express = require("express");
const router = express.Router();
const BillModel = require("../models/BillModel");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

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
        title: "Bills List",
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
  const { sDate, eDate } = req.body;
});

router.get("/search-for-bills-result", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  console.log(req.body);

  res.render("search-for-bills-result", {
    title: "البحث عن الفواتير",
    admin: req.user,
    totalProducts,
  });
});

module.exports = router;
