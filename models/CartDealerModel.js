const mongoose = require("mongoose");

const cartDealerSchema = new mongoose.Schema(
  {
    _id: {
      required: true,
      type: String,
    },

    userDealerId: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("cartDealer", cartDealerSchema);
