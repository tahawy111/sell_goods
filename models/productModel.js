const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

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
