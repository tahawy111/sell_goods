const mongoose = require("mongoose");

const recoverBilSchema = new mongoose.Schema(
  {
    billList: { type: Array, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("recover-bill", recoverBilSchema);
