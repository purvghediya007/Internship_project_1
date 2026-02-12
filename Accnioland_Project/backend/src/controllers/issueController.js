const Issue = require("../models/Issue");
const FloorPlan = require("../models/FloorPlan");

/**
 * Helper: derive color from issueType
 */
const getColorFromIssueType = (issueType) => {
  switch (issueType) {
    case "crack":
      return "red";
    case "dampness":
      return "blue";
    case "crack_dampness":
      return "green";
    default:
      return "black";
  }
};

/**
 * CREATE ISSUE
 * Supports:
 * 1️⃣ Old flow (single wall issue)
 * 2️⃣ New flow (multiple structure problems)
 */
exports.createIssue = async (req, res) => {
  try {
    const user = req.user;

    /* ================= FILE CHECK ================= */
    if (!req.files || !req.files.markedFloorPlan) {
      return res.status(400).json({ message: "Marked floor plan is required" });
    }

    const markedFloorPlan = req.files.markedFloorPlan[0].path;

    /* ================= BASE FLOOR PLAN (FIX) ================= */
    const floorPlan = await FloorPlan.findOne({
      floorNumber: user.floorNumber,
      $or: [
        { officeNumber: user.officeNumber }, // office-specific
        { officeNumber: null },              // floor-level
        { officeNumber: { $exists: false } } // legacy / undefined
      ],
    }).sort({ createdAt: -1 });

    if (!floorPlan) {
      return res.status(400).json({
        message: "Base floor plan not found for this floor/office",
      });
    }

    const baseData = {
      reportedBy: user._id,
      floorNumber: user.floorNumber,
      officeNumber: user.officeNumber,
      baseFloorPlan: floorPlan.planPdf,
      markedFloorPlan,
    };

    /* ================= LEGACY FLOW ================= */
    if (!req.body.structureProblems) {
      const issue = await Issue.create({
        ...baseData,
        wallDirection: req.body.wallDirection,
        wallLocationRef: req.body.wallLocationRef,
        description: req.body.description,
        issueImage: req.files.issueImage
          ? req.files.issueImage[0].path
          : null,
      });

      return res.status(201).json({
        message: "Issue created (legacy mode)",
        issue,
      });
    }

    /* ================= NEW STRUCTURED FLOW ================= */
    let structureProblems = JSON.parse(req.body.structureProblems);

    structureProblems = structureProblems.map((problem, index) => {
      if (!problem.structureType || !problem.direction || !problem.riskLevel) {
        throw new Error(`Invalid structure problem at index ${index}`);
      }

      const color = getColorFromIssueType(problem.issueType);

      return {
        structureType: problem.structureType,
        direction: problem.direction,
        issueType: problem.issueType,
        crackType: problem.crackType || null,
        dampnessLevel: problem.dampnessLevel || null,
        riskLevel: problem.riskLevel,
        description: problem.description,

        images: Object.values(req.files || {})
          .flat()
          .filter((f) => f.fieldname === `issueImages_${index}`)
          .map((f) => f.path),

        pdfMarks: (problem.pdfMarks || []).map((m) => ({
          pageIndex: m.pageIndex,
          x: m.x,
          y: m.y,
          color,
        })),
      };
    });

    const issue = await Issue.create({
      ...baseData,
      structureProblems,
    });

    res.status(201).json({
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    console.error("Create Issue Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

/**
 * GET ALL ISSUES (Manager)
 */
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "email floorNumber officeNumber")
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error("Get Issues Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ MANAGER ADD PHOTOS TO A SPOT
 * PATCH /api/issues/:issueId/spot/:spotIndex/add-photos
 */
exports.addSpotPhotos = async (req, res) => {
  try {
    const { issueId, spotIndex } = req.params;

    const index = Number(spotIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: "Invalid spot index" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (!issue.structureProblems || !issue.structureProblems[index]) {
      return res.status(404).json({ message: "Spot not found in this issue" });
    }

    // multer fields => req.files is object
    const fieldName = `issueImages_${index}`;
    const uploadedFiles = req.files?.[fieldName] || [];

    if (!uploadedFiles.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const newUrls = uploadedFiles.map((f) => f.path);

    if (!Array.isArray(issue.structureProblems[index].images)) {
      issue.structureProblems[index].images = [];
    }

    issue.structureProblems[index].images.push(...newUrls);

    await issue.save();

    return res.status(200).json({
      message: "Spot photos added successfully",
      added: newUrls.length,
      newUrls,
      issue,
    });
  } catch (error) {
    console.error("Add Spot Photos Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ MANAGER DELETE PHOTO FROM SPOT
 * DELETE /api/issues/:issueId/spot/:spotIndex/photo
 * Body: { photoUrl: "https://..." }
 */
exports.deleteSpotPhoto = async (req, res) => {
  try {
    const { issueId, spotIndex } = req.params;
    const { photoUrl } = req.body;

    const index = Number(spotIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: "Invalid spot index" });
    }

    if (!photoUrl) {
      return res.status(400).json({ message: "photoUrl is required" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (!issue.structureProblems || !issue.structureProblems[index]) {
      return res.status(404).json({ message: "Spot not found" });
    }

    const images = issue.structureProblems[index].images || [];
    const before = images.length;

    issue.structureProblems[index].images = images.filter((img) => img !== photoUrl);

    const after = issue.structureProblems[index].images.length;

    if (before === after) {
      return res.status(404).json({ message: "Photo not found in this spot" });
    }

    await issue.save();

    return res.status(200).json({
      message: "Photo deleted successfully",
      remaining: after,
      issue,
    });
  } catch (error) {
    console.error("Delete Spot Photo Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🆕 WORKER → GET MY ISSUES (HISTORY)
 * GET /api/issues/my
 */
exports.getMyIssues = async (req, res) => {
  try {
    const user = req.user;

    // Only office workers allowed
    if (user.userType !== "office_worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const issues = await Issue.find({
      reportedBy: user._id,
      floorNumber: user.floorNumber,
    })
      .sort({ createdAt: -1 });

    return res.status(200).json(issues);
  } catch (error) {
    console.error("Get My Issues Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🆕 WORKER → RESOLVE A STRUCTURE (SPOT)
 * PATCH /api/issues/:issueId/spot/:spotIndex/resolve
 */
exports.resolveStructureProblem = async (req, res) => {
  try {
    const user = req.user;
    const { issueId, spotIndex } = req.params;
    const { description } = req.body;

    // Only office workers allowed
    if (user.userType !== "office_worker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const index = Number(spotIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ message: "Invalid spot index" });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Ensure worker owns this issue
    if (String(issue.reportedBy) !== String(user._id)) {
      return res.status(403).json({ message: "Not authorized for this issue" });
    }

    if (!issue.structureProblems || !issue.structureProblems[index]) {
      return res.status(404).json({ message: "Spot not found in this issue" });
    }

    const spot = issue.structureProblems[index];

    // Prevent double resolve
    if (spot.status === "resolved") {
      return res.status(400).json({ message: "This spot is already resolved" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Resolution description is required" });
    }

    // Handle resolution images
    const uploadedFiles = req.files?.resolutionImages || [];
    const imageUrls = uploadedFiles.map((f) => f.path);

    // Update spot
    spot.status = "resolved";
    spot.resolution = {
      description,
      images: imageUrls,
      resolvedAt: new Date(),
      resolvedBy: user._id,
    };

    await issue.save();

    return res.status(200).json({
      message: "Structure resolved successfully",
      issue,
    });
  } catch (error) {
    console.error("Resolve Structure Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
