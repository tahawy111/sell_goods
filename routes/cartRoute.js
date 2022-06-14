const express = require("express");
const router = express.Router();
const CartModel = require("../models/CartModel");
const BillModel = require("../models/BillModel");
const UserDealerModel = require("../models/UserDealerModel");

const {
  ensureAuthenticated,
  forwardAuthenticated,
  isAdmin,
} = require("../config/auth");
const ProductModel = require("../models/productModel");

router.get("/cart/:id", ensureAuthenticated, (req, res, next) => {
  const { id } = req.params;

  const cartId = req.user.id;

  ProductModel.findById(id)
    .then((result) => {
      const name = result.name;
      const price = +result.price;

      const dealerPrice = +result.dealerPrice;

      const qtyInStore = +result.quantity;
      const newProduct = {
        _id: id,
        price: price,
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
              dealer: false,
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
              if (
                cart.selectedProduct[indexOfProduct].quantity >=
                cart.selectedProduct[indexOfProduct].qtyInStore
              ) {
                res.redirect("/");
              } else {
                console.log(cart.selectedProduct[indexOfProduct].quantity);
                console.log(cart.selectedProduct[indexOfProduct].qtyInStore);
                if (cart.dealer === true) {
                  cart.selectedProduct[indexOfProduct].quantity =
                    cart.selectedProduct[indexOfProduct].quantity + 1;

                  cart.selectedProduct[indexOfProduct].price =
                    cart.selectedProduct[indexOfProduct].price + dealerPrice;

                  cart.totalQuantity = cart.totalQuantity + 1;

                  cart.totalPrice = cart.totalPrice + dealerPrice;

                  CartModel.updateOne({ _id: cartId }, { $set: cart })
                    .then((doc) => {
                      res.redirect("/");
                    })
                    .catch((err) => console.log(err));
                } else {
                  cart.selectedProduct[indexOfProduct].quantity =
                    cart.selectedProduct[indexOfProduct].quantity + 1;

                  cart.selectedProduct[indexOfProduct].price =
                    cart.selectedProduct[indexOfProduct].price + price;

                  cart.totalQuantity = cart.totalQuantity + 1;

                  cart.totalPrice = cart.totalPrice + price;

                  CartModel.updateOne({ _id: cartId }, { $set: cart })
                    .then((doc) => {
                      res.redirect("/");
                    })
                    .catch((err) => console.log(err));
                }
              }
            }
            // if i chosed another unique product
            else {
              if (cart.dealer === true) {
                // update qty
                cart.totalQuantity = cart.totalQuantity + 1;

                // update total price
                cart.totalPrice = cart.totalPrice + dealerPrice;

                newProduct.price = dealerPrice;
                newProduct.priceOfOne = dealerPrice;

                // update product list
                cart.selectedProduct.push(newProduct);

                // update in mongodb
                CartModel.updateOne({ _id: cartId }, { $set: cart })
                  .then((doc) => {
                    res.redirect("/");
                  })
                  .catch((err) => console.log(err));
              } else {
                // update qty
                cart.totalQuantity = cart.totalQuantity + 1;

                // update total price
                cart.totalPrice = cart.totalPrice + price;

                // update product list
                cart.selectedProduct.push(newProduct);

                // update in mongodb
                CartModel.updateOne({ _id: cartId }, { $set: cart })
                  .then((doc) => {
                    res.redirect("/");
                  })
                  .catch((err) => console.log(err));
              }
            }
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});
router.post("/cart", ensureAuthenticated, (req, res, next) => {
  const { id } = req.body;
  const dealerUserId = req.body.userId;
  const cartId = req.user.id;

  UserDealerModel.findById(dealerUserId)
    .then((userResult) => {
      const dealerName = userResult.name;
      const address = userResult.address;
      const companyName = userResult.companyName;
      const phoneNumber = +userResult.phoneNumber;
      const telephoneFix = +userResult.telephoneFix;

      ProductModel.findById(id)
        .then((result) => {
          const name = result.name;
          const qtyInStore = +result.quantity;
          const price = +result.dealerPrice;
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
                  userDealer: {
                    dealerUserId,
                    dealerName,
                    address,
                    companyName,
                    phoneNumber,
                    telephoneFix,
                  },
                  dealer: true,
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
                      res.redirect("/");
                    })
                    .catch((err) => console.log(err));
                }
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});
router.post("/cart2", ensureAuthenticated, (req, res, next) => {
  const { barcode } = req.body;
  const dealerUserId = req.body.userId;
  const cartId = req.user.id;

  UserDealerModel.findById(dealerUserId)
    .then((userResult) => {
      const dealerName = userResult.name;
      const address = userResult.address;
      const companyName = userResult.companyName;
      const phoneNumber = +userResult.phoneNumber;
      const telephoneFix = +userResult.telephoneFix;

      ProductModel.findOne({ barcode: barcode })
        .then((result) => {
          const id = result._id;
          const name = result.name;
          const qtyInStore = +result.quantity;
          const price = +result.dealerPrice;
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
                  userDealer: {
                    dealerUserId,
                    dealerName,
                    address,
                    companyName,
                    phoneNumber,
                    telephoneFix,
                  },
                  dealer: true,
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
                      res.redirect("/");
                    })
                    .catch((err) => console.log(err));
                }
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.get("/cart2/:barcode", ensureAuthenticated, (req, res, next) => {
  const { barcode } = req.params;
  const cartId = req.user.id;

  ProductModel.findOne({ barcode: barcode })
    .then((result) => {
      const name = result.name;
      const price = +result.price;

      const dealerPrice = +result.dealerPrice;

      const qtyInStore = +result.quantity;
      const id = result._id;

      const newProduct = {
        _id: id,
        price: price,
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
              dealer: false,
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
              if (
                cart.selectedProduct[indexOfProduct].quantity >=
                cart.selectedProduct[indexOfProduct].qtyInStore
              ) {
                res.redirect("/");
              } else {
                if (cart.dealer === true) {
                  cart.selectedProduct[indexOfProduct].quantity =
                    cart.selectedProduct[indexOfProduct].quantity + 1;

                  cart.selectedProduct[indexOfProduct].price =
                    cart.selectedProduct[indexOfProduct].price + dealerPrice;

                  cart.totalQuantity = cart.totalQuantity + 1;

                  cart.totalPrice = cart.totalPrice + dealerPrice;

                  CartModel.updateOne({ _id: cartId }, { $set: cart })
                    .then((doc) => {
                      res.redirect("/");
                    })
                    .catch((err) => console.log(err));
                } else {
                  cart.selectedProduct[indexOfProduct].quantity =
                    cart.selectedProduct[indexOfProduct].quantity + 1;

                  cart.selectedProduct[indexOfProduct].price =
                    cart.selectedProduct[indexOfProduct].price + price;

                  cart.totalQuantity = cart.totalQuantity + 1;

                  cart.totalPrice = cart.totalPrice + price;

                  CartModel.updateOne({ _id: cartId }, { $set: cart })
                    .then((doc) => {
                      res.redirect("/");
                    })
                    .catch((err) => console.log(err));
                }
              }
            }
            // if i chosed another unique product
            else {
              if (cart.dealer === true) {
                // update qty
                cart.totalQuantity = cart.totalQuantity + 1;

                // update total price
                cart.totalPrice = cart.totalPrice + dealerPrice;

                newProduct.price = dealerPrice;
                newProduct.priceOfOne = dealerPrice;

                // update product list
                cart.selectedProduct.push(newProduct);

                // update in mongodb
                CartModel.updateOne({ _id: cartId }, { $set: cart })
                  .then((doc) => {
                    res.redirect("/");
                  })
                  .catch((err) => console.log(err));
              } else {
                // update qty
                cart.totalQuantity = cart.totalQuantity + 1;

                // update total price
                cart.totalPrice = cart.totalPrice + price;

                // update product list
                cart.selectedProduct.push(newProduct);

                // update in mongodb
                CartModel.updateOne({ _id: cartId }, { $set: cart })
                  .then((doc) => {
                    res.redirect("/");
                  })
                  .catch((err) => console.log(err));
              }
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
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
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
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
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
    userDealer: req.user.cart.userDealer,
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
