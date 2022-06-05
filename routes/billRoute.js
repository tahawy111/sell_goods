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
        title: "Bill",
        admin: req.user,
        data: doc,
      });
    })
    .catch((err) => console.log(err));
});
router.post("/search-bills", ensureAuthenticated, (req, res) => {
  console.log(req.body.search);
});

module.exports = router;
