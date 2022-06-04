const express = require("express");
const router = express.Router();
const CartModel = require("../models/CartModel");
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");

router.get("/cart/:id/:name/:price", ensureAuthenticated, (req, res, next) => {
  const { id, name } = req.params;
  const price = +req.params.price;
  const cartId = req.user.id;
  const newProduct = {
    _id: id,
    price,
    name,
    quantity: 1,
  };
  // console.log(req.user);
  // console.log(req.user.cart);
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
          cart.selectedProduct[indexOfProduct].quantity =
            cart.selectedProduct[indexOfProduct].quantity + 1;

          cart.selectedProduct[indexOfProduct].price =
            cart.selectedProduct[indexOfProduct].price + price;

          cart.totalQuantity = cart.totalQuantity + 1;

          cart.totalPrice = cart.totalPrice + price;

          CartModel.updateOne({ _id: cartId }, { $set: cart })
            .then((doc) => {
              // console.log(doc);
              // console.log(cart);
              res.redirect("/");
            })
            .catch((err) => console.log(err));
        }
        // if i chosed another unique product
        else {
          // update qty
          cart.totalQuantity = cart.totalQuantity + 1;

          // update total price
          cart.totalPrice = cart.totalPrice + price;

          // update product list
          cart.selectedProduct.push(newProduct);

          // update in mongodb
          CartModel.updateOne({ _id: cartId }, { $set: cart })
            .then((doc) => {
              // console.log(doc);
              // console.log(cart);
              res.redirect("/");
            })
            .catch((err) => console.log(err));
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
