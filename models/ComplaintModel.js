const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    complaintContent: { type: String, required: true },
    number: { type: Number, required: true },
    solved: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("complaint", complaintSchema);
