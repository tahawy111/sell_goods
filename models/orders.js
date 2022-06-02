const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    totalQty: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    selectedProduct: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", ordersSchema);
