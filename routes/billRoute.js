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

module.exports = router;
