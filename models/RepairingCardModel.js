const mongoose = require("mongoose");

const RepairingCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    damageName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    state: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model("RepairingCard", RepairingCardSchema);
