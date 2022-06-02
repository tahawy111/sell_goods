const express = require("express");
const router = express.Router();
const orders = require("../models/orders");

router.get("/sell/:id/:price/:name", (req, res) => {
  console.log(req.params.id, req.params.price);
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
          selectedProduct: [selectedProduct],
        });

        newOrder
          .save()
          .then((doc) => {
            console.log(doc);
          })
          .catch((err) => console.log(err));
      }
      if (order) {
        console.log("Update product");
      }
    })
    .catch((err) => console.log(err));

  res.redirect("/");
});

module.exports = router;
