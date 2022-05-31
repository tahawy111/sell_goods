const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    password: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", userSchema);
