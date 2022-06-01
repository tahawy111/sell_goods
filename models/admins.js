const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: String,
    username: String,
    password: String,
    comment: String,
    // Permissions
    createAdmins: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin", adminSchema);
