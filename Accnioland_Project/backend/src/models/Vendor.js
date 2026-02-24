const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    service: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
module.exports.schema = vendorSchema;