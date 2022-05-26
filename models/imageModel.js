const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("image", imageSchema);
