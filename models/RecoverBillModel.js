const mongoose = require("mongoose");

const recoverBilSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("recover-bill", recoverBilSchema);
