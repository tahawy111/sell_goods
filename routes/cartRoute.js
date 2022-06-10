const express = require("express");
const router = express.Router();
const CartModel = require("../models/CartModel");
const BillModel = require("../models/BillModel");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");
const ProductModel = require("../models/productModel");

router.get(
  "/cart/:id/:name/:price/:qtyinstore",
  ensureAuthenticated,
  (req, res, next) => {
    const { id, name } = req.params;
    const price = +req.params.price;
    const qtyInStore = +req.params.qtyinstore;
    const cartId = req.user.id;

    const newProduct = {
      _id: id,
      price,
      priceOfOne: price,
      name,
      quantity: 1,
      qtyInStore,
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
  }
);

router.get("/cart/:barcode", ensureAuthenticated, (req, res, next) => {
  const { barcode } = req.params;
  ProductModel.findOne({ barcode: barcode })
    .then((result) => {
      const id = result._id;
      const name = result.name;
      const price = +result.price;
      const qtyInStore = +result.quantity;
      const cartId = req.user.id;

      const newProduct = {
        _id: id,
        price,
        priceOfOne: price,
        name,
        quantity: 1,
        qtyInStore,
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
              })
              .catch((err) => console.log(err));
          }
          if (cart) {
            let indexOfProduct = -1;
            for (let i = 0; i < cart.selectedProduct.length; i++) {
              if (
                JSON.stringify(id) ===
                JSON.stringify(cart.selectedProduct[i]._id)
              ) {
                indexOfProduct = i;
                break;
              }
            }
            // if i chosed the same product it's gonna update
            if (indexOfProduct >= 0) {
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
    })
    .catch((err) => console.log(err));
});

router.get("/cart", ensureAuthenticated, (req, res, next) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
    res.redirect("/");
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  const userCart = req.user.cart;

  res.render("cart", {
    title: "Cart",
    totalProducts,
    admin: req.user,
  });
});

router.get("/cart/incProduct/:index", ensureAuthenticated, (req, res) => {
  const { index } = req.params;
  const userCart = req.user.cart;
  const productPrice = userCart.selectedProduct[index].priceOfOne;
  // Edit
  userCart.selectedProduct[index].quantity =
    userCart.selectedProduct[index].quantity + 1;

  userCart.totalQuantity = userCart.totalQuantity + 1;

  userCart.selectedProduct[index].price =
    userCart.selectedProduct[index].price + productPrice;

  userCart.totalPrice = userCart.totalPrice + productPrice;

  CartModel.updateOne({ _id: userCart._id }, { $set: userCart })
    .then((doc) => {
      console.log(doc);
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));

  console.log(userCart);
});
router.get("/cart/decProduct/:index", ensureAuthenticated, (req, res) => {
  const { index } = req.params;
  const userCart = req.user.cart;
  const productPrice = userCart.selectedProduct[index].priceOfOne;
  // Edit
  userCart.selectedProduct[index].quantity =
    userCart.selectedProduct[index].quantity - 1;

  userCart.totalQuantity = userCart.totalQuantity - 1;

  userCart.selectedProduct[index].price =
    userCart.selectedProduct[index].price - productPrice;

  userCart.totalPrice = userCart.totalPrice - productPrice;

  CartModel.updateOne({ _id: userCart._id }, { $set: userCart })
    .then((doc) => {
      console.log(doc);
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));

  console.log(userCart);
});

router.get("/cart/deleteProduct/:index", ensureAuthenticated, (req, res) => {
  const { index } = req.params;
  const productsArray = req.user.cart.selectedProduct;

  if (req.user.cart.selectedProduct.length <= 1) {
    CartModel.findByIdAndDelete(req.user.cart._id).then((result) => {
      res.redirect("/");
    });
  } else {
    req.user.cart.totalQuantity =
      req.user.cart.totalQuantity -
      req.user.cart.selectedProduct[index].quantity;

    req.user.cart.totalPrice =
      req.user.cart.totalPrice - req.user.cart.selectedProduct[index].price;

    productsArray.splice(index, 1);

    CartModel.updateOne({ _id: req.user.cart._id }, { $set: req.user.cart })
      .then((doc) => {
        res.redirect("/cart");
      })
      .catch((err) => console.log(err));
  }

  console.log(req.user.cart);
});

router.get("/cart/sell/deleteAll", ensureAuthenticated, (req, res) => {
  CartModel.findByIdAndDelete(req.user.cart._id)
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
});

router.get("/cart/sell/newBill", ensureAuthenticated, (req, res) => {
  let totalProducts = null;

  if (!req.user.cart) {
    totalProducts = "";
    res.redirect("/");
  } else {
    totalProducts = req.user.cart.totalQuantity;
  }

  req.user.cart.selectedProduct.forEach((ele) => {
    ProductModel.findOne({ _id: ele._id })
      .then((doc) => {
        doc.quantity = +doc.quantity - +ele.quantity;
        ProductModel.findByIdAndUpdate(ele._id, {
          quantity: doc.quantity,
        })
          .then((result) => {})
          .catch((err) => console.log(err));
      })
      .then((result) => {})
      .catch((err) => console.log(err));
  });

  const bill = new BillModel({
    totalQuantity: req.user.cart.totalQuantity,
    totalPrice: req.user.cart.totalPrice,
    selectedProduct: req.user.cart.selectedProduct,
    adminName: req.user.name,
    adminUsername: req.user.username,
  });
  bill
    .save()
    .then((result) => {
      res.render("success-page", {
        title: "Success",
        admin: req.user,
        success_title: "تمت عملية البيع بنجاح",
        btn_title: "طباعة الفاتورة",
        btn_url: `/bills-list/print/${result._id}`,
        target: "_blank",
        totalProducts,
      });
      CartModel.findByIdAndDelete(req.user.cart._id)
        .then((result) => {})
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

module.exports = router;
