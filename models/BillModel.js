const mongoose = require("mongoose");
let counter = 1;
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
      type: Number,
      default: Date.now(),
    },
    userDealer: {
      required: false,
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bill", billSchema);
