const mongoose = require("mongoose");

const closeAccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weekDay: { type: String, required: true },
    dateOfToday: { type: String, required: true },
    oldAmount: { type: Number, required: true },
    totalPull: { type: Number, required: true },
    addedMoney: { type: Number },
    totalBill: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    shop: { type: Number, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Close-Account", closeAccountSchema);
