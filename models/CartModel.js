const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    amount: Number,
    userId: String,
    productId: String,
    timestamp: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", cartSchema);
