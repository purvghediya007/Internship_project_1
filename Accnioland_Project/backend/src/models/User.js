const mongoose= require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["office_worker", "manager"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      // lowercase: true,
      unique: true,
    },
    floorNumber: {
      type: Number,
      default: null,
    },
    officeNumber: {
      type: Number,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);