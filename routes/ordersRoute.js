const express = require("express");
const router = express.Router();
const orders = require("../models/orders");

router.get("/sell/:id/:price", (req, res) => {
  console.log(req.params.id, req.params.price);
  const orderid = req.user.id;
  orders
    .findById(ordersid)
    .then((order) => {
      if (!order) {
        const newUser = new orders({
          _id: orderid,
          totalQty: 1,
        });
      }
    })
    .catch((err) => console.log(err));

  res.redirect("/");
});

module.exports = router;
