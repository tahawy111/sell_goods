const express = require("express");
const router = express.Router();
const orders = require("../models/orders");

router.get("/sell/:id/:name/:price", (req, res) => {
  const orderid = req.user.id;
  const newProductPrice = parseInt(req.params.price, 10);

  const newProduct = {
    _id: req.params.id,
    name: req.params.name,
    price: newProductPrice,
  };

  orders
    .findById(orderid)
    .then((order) => {
      if (!order) {
        const newOrder = new orders({
          _id: orderid,
          totalQty: 1,
          totalPrice: newProductPrice,
          selectedProduct: [newProduct],
        });

        newOrder
          .save()
          .then((doc) => {
            console.log(doc);
          })
          .catch((err) => console.log(err));
      }
      if (order) {
        let indexOfProduct = -1;
        for (let i = 0; i < order.selectedProduct.length; i++) {
          if (req.params.id === order.selectedProduct[i]._id) {
            indexOfProduct = i;
            break;
          }
        }

        if (indexOfProduct >= 0) {
          console.log(`Update product of index ${indexOfProduct}`);
        } else {
          order.totalQty = order.totalQty + 1;
          order.totalPrice = order.totalPrice + newProductPrice;
          order.selectedProduct.push(newProduct);

          orders
            .updateOne({ _id: orderid }, { $set: order })
            .then((result) => {
              console.log(result);

              console.log(order);
            })
            .catch((err) => console.log(err));
        }
      }
    })
    .catch((err) => console.log(err));

  res.redirect("/");
});

module.exports = router;
