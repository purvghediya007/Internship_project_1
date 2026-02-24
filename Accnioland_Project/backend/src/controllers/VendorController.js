// const Vendor = require("../models/Vendor");

// /* CREATE */
// exports.createVendor = async (req, res) => {
//   try {
//     const vendor = await Vendor.create({
//       ...req.body,
//       createdBy: req.user.id
//     });

//     res.status(201).json(vendor);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* READ ALL */
// exports.getAllVendors = async (req, res) => {
//   try {
//     const vendors = await Vendor.find().sort({ createdAt: -1 });
//     res.json(vendors);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* READ ONE */
// exports.getVendorById = async (req, res) => {
//   try {
//     const vendor = await Vendor.findById(req.params.id);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });

//     res.json(vendor);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* UPDATE */
// exports.updateVendor = async (req, res) => {
//   try {
//     const vendor = await Vendor.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });

//     res.json(vendor);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* DELETE */
// exports.deleteVendor = async (req, res) => {
//   try {
//     const vendor = await Vendor.findByIdAndDelete(req.params.id);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });

//     res.json({ message: "Vendor deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const VendorSchema = require("../models/Vendor").schema;
const GlobalUser = require("../models/GlobalUser");
const getConnection = require("../config/dbManager");

/* CREATE */
exports.createVendor = async (req, res) => {
  try {
    const building = req.user.building;   // from JWT

    const connection = await getConnection(building);
    const Vendor = connection.model("Vendor", VendorSchema);

    const vendor = await Vendor.create(req.body);

    res.status(201).json(vendor);
  } catch (err) {
    console.error("CREATE VENDOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL */
exports.getAllVendors = async (req, res) => {
  try {
    const building = req.user.building;

    const connection = await getConnection(building);
    const Vendor = connection.model("Vendor", VendorSchema);

    const vendors = await Vendor.find().sort({ createdAt: -1 });

    res.json(vendors);
  } catch (err) {
    console.error("GET VENDORS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
exports.updateVendor = async (req, res) => {
  try {
    const building = req.user.building;

    const connection = await getConnection(building);
    const Vendor = connection.model("Vendor", VendorSchema);

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(vendor);
  } catch (err) {
    console.error("UPDATE VENDOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
exports.deleteVendor = async (req, res) => {
  try {
    const building = req.user.building;

    const connection = await getConnection(building);
    const Vendor = connection.model("Vendor", VendorSchema);

    await Vendor.findByIdAndDelete(req.params.id);

    res.json({ message: "Vendor Deleted" });
  } catch (err) {
    console.error("DELETE VENDOR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};