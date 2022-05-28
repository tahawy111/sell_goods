const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    image: String,
  },
  { timestamps: true }
);
productSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("product", productSchema);
