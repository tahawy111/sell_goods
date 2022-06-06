const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category: String,
});

module.exports = mongoose.model("categories", categorySchema);
