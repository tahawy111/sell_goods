const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    _id: {
      required: true,
      type: String,
    },
    totalQuantity: {
      required: true,
      type: Number,
    },
    totalPrice: {
      required: true,
      type: Number,
    },
    selectedProduct: {
      required: true,
      type: Array,
    },
    userDealer: {
      required: false,
      type: Object,
    },
    dealer: {
      required: true,
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("cart", cartSchema);
