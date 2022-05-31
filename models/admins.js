const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin", adminSchema);
