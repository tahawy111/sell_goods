const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    quantity: Number,
    barcode: Number,
    image: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("product", productSchema);
