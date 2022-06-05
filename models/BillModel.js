const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
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
    adminName: {
      required: true,
      type: String,
    },
    adminUsername: {
      required: true,
      type: String,
    },
    billNumber: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bill", billSchema);
