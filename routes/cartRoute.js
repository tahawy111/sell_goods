const express = require("express");
const router = express.Router();
const CartModel = require("../models/CartModel");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

router.get("/cart/:id/:name/:price", (req, res, next) => {
  const { id, name } = req.params;
  const price = +req.params.price;
  const cartId = req.user.id;
  const newProduct = {
    _id: id,
    price,
    name,
  };
  CartModel.findById(cartId)
    .then((cart) => {
      if (!cart) {
        const newCart = CartModel({
          _id: cartId,
          totalQuantity: 1,
          totalPrice: price,
          selectedProduct: [newProduct],
        });
        newCart
          .save()
          .then((doc) => {
            res.redirect("/");
            console.log(doc);
          })
          .catch((err) => console.log(err));
      }
      if (cart) {
        let indexOfProduct = -1;
        for (let i = 0; i < cart.selectedProduct.length; i++) {
          if (id === cart.selectedProduct[i]._id) {
            indexOfProduct = i;
            break;
          }
        }
        // if i chosed the same product it's gonna update
        if (indexOfProduct >= 0) {
          console.log("update Product of index", indexOfProduct);
        }
        // if i chosed the same product it's gonna update
        else {
          cart.totalQuantity = totalQuantity + 1;
          cart.totalPrice = cart.totalPrice + price;
        }
      }
    })
    .catch((err) => console.log(err));
});

// router.get("/cart", (req, res, next) => {
//   CartModel.find({ userId: req.user.id })
//     .then((items) => {
//       res.render("cart", {
//         title: "Cart",
//         items,
//         admin: req.user,
//       });
//     })
//     .catch((err) => console.log(err));
// });

module.exports = router;
