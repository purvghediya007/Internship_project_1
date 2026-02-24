const mongoose = require("mongoose");

const globalUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  buildingName: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("GlobalUser", globalUserSchema);
