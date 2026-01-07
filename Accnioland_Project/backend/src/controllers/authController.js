const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      userType,
      email,
      floorNumber,
      officeNumber,
      password,
    } = req.body;

    // email must be unique for everyone
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // role-based validation
    if (userType === "office_worker") {
      if (floorNumber == null || officeNumber == null) {
        return res.status(400).json({
          message: "Floor number and office number are required for office worker",
        });
      }
    }

    if (userType === "manager") {
      // manager should NOT send floor/office
      if (floorNumber || officeNumber) {
        return res.status(400).json({
          message: "Manager should not have floor or office number",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userType,
      email,
      floorNumber: userType === "office_worker" ? floorNumber : null,
      officeNumber: userType === "office_worker" ? officeNumber : null,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { userType, floorNumber, email, password } = req.body;

    let user;

    if (userType === "office_worker") {
      if (!floorNumber) {
        return res.status(400).json({ message: "Floor number is required" });
      }

      const users = await User.find({ userType, floorNumber });

      for (let u of users) {
        const isMatch = await bcrypt.compare(password, u.password);
        if (isMatch) {
          user = u;
          break;
        }
      }
    }

    if (userType === "manager") {
      if (!email) {
        return res.status(400).json({ message: "Email is required for manager" });
      }

      const manager = await User.findOne({ email, userType: "manager" });
      if (manager && (await bcrypt.compare(password, manager.password))) {
        user = manager;
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
  {
    _id: user._id,   // ✅ FIXED
    userType: user.userType,
    floorNumber: user.floorNumber,
    officeNumber: user.officeNumber,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
