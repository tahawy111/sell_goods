const mongoose = require('mongoose');

const UserDealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    companyName: { type: String, required: false },
    phoneNumber: { type: String, required: true },
    telephoneFix: { type: String, required: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model('userDealer', UserDealerSchema);
