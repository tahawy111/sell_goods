const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: String,
    username: String,
    password: String,
    comment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin", adminSchema);
