const express = require("express");
const router = express.Router();
const CartModel = require("../models/CartModel");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

router.post("/cart", ensureAuthenticated, (req, res) => {
  const { id, name, price } = req.body;

  const newCart = CartModel({
    name,
    price,
    amount: 1,
    userId: req.user.id,
    productId: id,
    timestamp: Date.now(),
  });

  newCart
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => console.log(err));
});

router.get("/cart", (req, res, next) => {
  CartModel.find({ userId: req.user.id })
    .then((items) => {
      res.render("cart", {
        title: "Cart",
        items,
        admin: req.user,
      });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
