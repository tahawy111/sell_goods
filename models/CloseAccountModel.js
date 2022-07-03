const mongoose = require('mongoose');

const closeAccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weekDay: { type: String, required: true },
    dateOfToday: { type: String, required: true },
    oldAmount: { type: Number, required: true, default: 0 },
    totalPull: { type: Number, required: true, default: 0 },
    addedMoney: { type: Number, default: 0 },
    totalBill: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, default: 0 },
    shop: { type: Number, default: 0 },
    treasury: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Close-Account', closeAccountSchema);
