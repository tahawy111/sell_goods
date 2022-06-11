const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    dealerPrice: Number,
    wholesale: Number,
    quantity: Number,
    barcode: String,
    image: String,
    category: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("product", productSchema);
