const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    dellerPrice: Number,
    quantity: Number,
    barcode: String,
    image: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("product", productSchema);
