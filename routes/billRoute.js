const express = require("express");
const router = express.Router();
const BillModel = require("../models/BillModel");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

router.get("/bills-list", (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
    res.redirect("/");
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

module.exports = router;
