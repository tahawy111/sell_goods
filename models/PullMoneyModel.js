const mongoose = require("mongoose");

const pullMoneySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    why: { type: String },
    file: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("pull-Monie", pullMoneySchema);
