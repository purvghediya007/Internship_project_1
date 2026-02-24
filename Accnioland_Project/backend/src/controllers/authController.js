const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const GlobalUser = require("../models/GlobalUser");
const getConnection = require("../config/dbManager");



// // REGISTER
// exports.register = async (req, res) => {
//   try {
//     const {
//       userType,
//       email,
//       floorNumber,
//       officeNumber,
//       password,
//     } = req.body;

//     // email must be unique for everyone
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     // role-based validation
//     if (userType === "office_worker") {
//       if (floorNumber == null || officeNumber == null) {
//         return res.status(400).json({
//           message: "Floor number and office number are required for office worker",
//         });
//       }
//     }

//     if (userType === "manager") {
//       // manager should NOT send floor/office
//       if (floorNumber || officeNumber) {
//         return res.status(400).json({
//           message: "Manager should not have floor or office number",
//         });
//       }
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       userType,
//       email,
//       floorNumber: userType === "office_worker" ? floorNumber : null,
//       officeNumber: userType === "office_worker" ? officeNumber : null,
//       password: hashedPassword,
//     });

//     res.status(201).json({
//       message: "User registered successfully",
//       userId: user._id,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// REGISTER
exports.register = async (req, res) => {
  try {
    const { buildingName, userType, email, floorNumber, officeNumber, password } = req.body;


    // 🔒 COMMON VALIDATION
    if (!userType || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (userType === "manager") {
      if (!email) {
        return res.status(400).json({
          message: "Email is required for manager",
        });
      }
    }

    if (userType === "office_worker") {
      if (floorNumber == null || officeNumber == null) {
        return res.status(400).json({
          message: "Floor number and office number are required",
        });
      }

      // office worker must still have email
      if (!email) {
        return res.status(400).json({
          message: "Email is required for office worker",
        });
      }
    }

    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({ message: "Email already registered" });
    // }

    // 🔐 Check globally if email already exists
    const existingGlobal = await GlobalUser.findOne({ email });
    if (existingGlobal) {
      return res.status(400).json({ message: "Email already registered" });
    }


    if (!buildingName) {
      return res.status(400).json({ message: "Building name is required" });
    } 

// 🔥 Connect to building DB
    const connection = await getConnection(buildingName);
    const BuildingUser = connection.model("User", User.schema);


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await BuildingUser.create({
      userType,
      email,
      floorNumber: userType === "office_worker" ? floorNumber : null,
      officeNumber: userType === "office_worker" ? officeNumber : null,
      password: hashedPassword,
    });

    // 🔥 Save mapping in central DB
    await GlobalUser.create({
      email,
      buildingName
    });

    // console.log("Saving mapping for:", email, buildingName);

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { userType, floorNumber, email, password } = req.body;


    // 🔥 Find building from central mapping
  const globalUser = await GlobalUser.findOne({ email });
// console.log("Login email:", email);

  if (!globalUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const buildingName = globalUser.buildingName;

  // 🔥 Connect to correct building DB
  const connection = await getConnection(buildingName);
  const BuildingUser = connection.model("User", User.schema);


    let user;

    if (userType === "office_worker") {
      if (!floorNumber) {
        return res.status(400).json({ message: "Floor number is required" });
      }

      const users = await BuildingUser.find({ userType, floorNumber });

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

      const manager = await BuildingUser.findOne({ email, userType: "manager" });
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
    building: buildingName,

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

// // LOGIN
// exports.login = async (req, res) => {
//   try {
//     const { userType, email, floorNumber, password } = req.body;

//     if (!userType || !email || !password) {
//       return res.status(400).json({
//         message: "Missing required fields",
//       });
//     }

//     let user;

//     /* ================= OFFICE WORKER LOGIN ================= */
//     if (userType === "office_worker") {
//       if (!floorNumber) {
//         return res.status(400).json({
//           message: "Floor number is required for office worker",
//         });
//       }

//       user = await User.findOne({
//         userType: "office_worker",
//         email,
//         floorNumber,
//       });

//       if (!user) {
//         return res.status(401).json({
//           message: "Invalid email, floor number or password",
//         });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({
//           message: "Invalid email, floor number or password",
//         });
//       }
//     }

//     /* ================= MANAGER LOGIN ================= */
//     if (userType === "manager") {
//       user = await User.findOne({
//         userType: "manager",
//         email,
//       });

//       if (!user) {
//         return res.status(401).json({
//           message: "Invalid email or password",
//         });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return res.status(401).json({
//           message: "Invalid email or password",
//         });
//       }
//     }

//     /* ================= JWT TOKEN ================= */
//     const token = jwt.sign(
//       {
//         _id: user._id,
//         userType: user.userType,
//         floorNumber: user.floorNumber,
//         officeNumber: user.officeNumber,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         userType: user.userType,
//         email: user.email,
//         floorNumber: user.floorNumber,
//         officeNumber: user.officeNumber,
//       },
//     });

//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

