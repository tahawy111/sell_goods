const mongoose = require("mongoose");

const recoverBillListSchema = new mongoose.Schema(
  {
    createdBy: { type: String, required: true },
    recoverBillData: { type: Array, required: true },
    total: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    billNumber: { type: Number, default: Date.now() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recover-Bill-List", recoverBillListSchema);
