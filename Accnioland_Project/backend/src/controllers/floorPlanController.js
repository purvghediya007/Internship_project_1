const FloorPlan = require("../models/FloorPlan");
const getConnection = require("../config/dbManager");

// MANAGER uploads base PDF
exports.uploadBaseFloorPlan = async (req, res) => {

  const connection = await getConnection(req.user.building);
  const FloorPlanDB = connection.model("FloorPlan", FloorPlan.schema);
  try {
    const { floorNumber, officeNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Base PDF is required" });
    }

    const plan = await FloorPlanDB.create({
      uploadedBy: req.user._id,
      floorNumber,
      officeNumber: officeNumber || null,
      planPdf: req.file.path,
    });

    res.status(201).json({
      message: "Base floor plan uploaded successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyBaseFloorPlan = async (req, res) => {

  const connection = await getConnection(req.user.building);
  const FloorPlanDB = connection.model("FloorPlan", FloorPlan.schema);
  try {
    const { floorNumber, officeNumber } = req.user;

    // Office-specific first
    let plan = await FloorPlanDB.findOne({
      floorNumber,
      officeNumber,
    }).sort({ createdAt: -1 });

    // Fallback to floor-level
    if (!plan) {
      plan = await FloorPlanDB.findOne({
        floorNumber,
        officeNumber: null,
      }).sort({ createdAt: -1 });
    }

    if (!plan) {
      return res.status(404).json({
        message: "No base floor plan available",
      });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

