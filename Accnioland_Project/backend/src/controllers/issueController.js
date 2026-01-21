// const Issue = require("../models/Issue");
// const FloorPlan = require("../models/FloorPlan");


// /**
//  * Helper: derive color from issueType
//  * (backend safety – frontend already handles this)
//  */
// const getColorFromIssueType = (issueType) => {
//   switch (issueType) {
//     case "crack":
//       return "red";
//     case "dampness":
//       return "blue";
//     case "crack_dampness":
//       return "green";
//     default:
//       return "black";
//   }
// };

// /**
//  * CREATE ISSUE
//  * Supports:
//  * 1️⃣ Old flow (single wall issue)
//  * 2️⃣ New flow (multiple structure problems)
//  */
// exports.createIssue = async (req, res) => {
//   try {
//     const user = req.user;

//     /* ================= FILE CHECK ================= */
//     if (!req.files || !req.files.markedFloorPlan) {
//       return res.status(400).json({ message: "Marked floor plan is required" });
//     }

//     const markedFloorPlan = req.files.markedFloorPlan[0].path;

//     /* ================= BASE FLOOR PLAN (FIX) ================= */
//     // const floorPlan = await FloorPlan.findOne({
//     //   floorNumber: user.floorNumber,
//     //   $or: [
//     //     { officeNumber: user.officeNumber },
//     //     { officeNumber:null},
//     //   ],
//     // });
//     const floorPlan = await FloorPlan.findOne({
//   floorNumber: user.floorNumber,
//   $or: [
//     { officeNumber: user.officeNumber }, // office-specific
//     { officeNumber: null },              // floor-level
//     { officeNumber: { $exists: false } } // legacy / undefined
//   ],
// }).sort({ createdAt: -1 });


//     if (!floorPlan) {
//       return res.status(400).json({
//         message: "Base floor plan not found for this floor/office",
//       });
//     }

//     const baseData = {
//       reportedBy: user._id,
//       floorNumber: user.floorNumber,
//       officeNumber: user.officeNumber,
//       baseFloorPlan: floorPlan.planPdf, // ✅ FIXED
//       markedFloorPlan,
//     };

//     /* ================= LEGACY FLOW ================= */
//     if (!req.body.structureProblems) {
//       const issue = await Issue.create({
//         ...baseData,
//         wallDirection: req.body.wallDirection,
//         wallLocationRef: req.body.wallLocationRef,
//         description: req.body.description,
//         issueImage: req.files.issueImage
//           ? req.files.issueImage[0].path
//           : null,
//       });

//       return res.status(201).json({
//         message: "Issue created (legacy mode)",
//         issue,
//       });
//     }

//     /* ================= NEW STRUCTURED FLOW ================= */
//     let structureProblems = JSON.parse(req.body.structureProblems);

//     structureProblems = structureProblems.map((problem, index) => {
//       if (!problem.structureType || !problem.direction || !problem.riskLevel) {
//         throw new Error(`Invalid structure problem at index ${index}`);
//       }

//       const color = getColorFromIssueType(problem.issueType);

//       return {
//         structureType: problem.structureType,
//         direction: problem.direction,
//         issueType: problem.issueType,
//         crackType: problem.crackType || null,
//         dampnessLevel: problem.dampnessLevel || null,
//         riskLevel: problem.riskLevel,
//         description: problem.description,
//         images: Object.values(req.files || {})
//           .flat()
//           .filter((f) => f.fieldname === `issueImages_${index}`)
//           .map((f) => f.path),
//         pdfMarks: (problem.pdfMarks || []).map((m) => ({
//           pageIndex: m.pageIndex,
//           x: m.x,
//           y: m.y,
//           color,
//         })),
//       };
//     });

//     const issue = await Issue.create({
//       ...baseData,
//       structureProblems,
//     });

//     res.status(201).json({
//       message: "Issue created successfully",
//       issue,
//     });
//   } catch (error) {
//     console.error("Create Issue Error:", error.message);
//     res.status(400).json({ message: error.message });
//   }
// };


// /**
//  * GET ALL ISSUES (Manager)
//  */
// exports.getAllIssues = async (req, res) => {
//   try {
//     const issues = await Issue.find()
//       .populate("reportedBy", "email floorNumber officeNumber")
//       .sort({ createdAt: -1 });

//     res.json(issues);
//   } catch (error) {
//     console.error("Get Issues Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// const Issue = require("../models/Issue");
// const FloorPlan = require("../models/FloorPlan");


// /**
//  * Helper: derive color from issueType
//  * (backend safety – frontend already handles this)
//  */
// const getColorFromIssueType = (issueType) => {
//   switch (issueType) {
//     case "crack":
//       return "red";
//     case "dampness":
//       return "blue";
//     case "crack_dampness":
//       return "green";
//     default:
//       return "black";
//   }
// };

// /**
//  * CREATE ISSUE
//  * Supports:
//  * 1️⃣ Old flow (single wall issue)
//  * 2️⃣ New flow (multiple structure problems)
//  */
// exports.createIssue = async (req, res) => {
//   try {
//     const user = req.user;

//     /* ================= FILE CHECK ================= */
//     if (!req.files || !req.files.markedFloorPlan) {
//       return res.status(400).json({ message: "Marked floor plan is required" });
//     }

//     const markedFloorPlan = req.files.markedFloorPlan[0].path;

//     /* ================= BASE FLOOR PLAN (FIX) ================= */
//     // const floorPlan = await FloorPlan.findOne({
//     //   floorNumber: user.floorNumber,
//     //   $or: [
//     //     { officeNumber: user.officeNumber },
//     //     { officeNumber:null},
//     //   ],
//     // });
//     const floorPlan = await FloorPlan.findOne({
//   floorNumber: user.floorNumber,
//   $or: [
//     { officeNumber: user.officeNumber }, // office-specific
//     { officeNumber: null },              // floor-level
//     { officeNumber: { $exists: false } } // legacy / undefined
//   ],
// }).sort({ createdAt: -1 });


//     if (!floorPlan) {
//       return res.status(400).json({
//         message: "Base floor plan not found for this floor/office",
//       });
//     }

//     const baseData = {
//       reportedBy: user._id,
//       floorNumber: user.floorNumber,
//       officeNumber: user.officeNumber,
//       baseFloorPlan: floorPlan.planPdf, // ✅ FIXED
//       markedFloorPlan,
//     };

//     /* ================= LEGACY FLOW ================= */
//     if (!req.body.structureProblems) {
//       const issue = await Issue.create({
//         ...baseData,
//         wallDirection: req.body.wallDirection,
//         wallLocationRef: req.body.wallLocationRef,
//         description: req.body.description,
//         issueImage: req.files.issueImage
//           ? req.files.issueImage[0].path
//           : null,
//       });

//       return res.status(201).json({
//         message: "Issue created (legacy mode)",
//         issue,
//       });
//     }

//     /* ================= NEW STRUCTURED FLOW ================= */
//     let structureProblems = JSON.parse(req.body.structureProblems);

//     structureProblems = structureProblems.map((problem, index) => {
//       if (!problem.structureType || !problem.direction || !problem.riskLevel) {
//         throw new Error(`Invalid structure problem at index ${index}`);
//       }

//       const color = getColorFromIssueType(problem.issueType);

//       return {
//         structureType: problem.structureType,
//         direction: problem.direction,
//         issueType: problem.issueType,
//         crackType: problem.crackType || null,
//         dampnessLevel: problem.dampnessLevel || null,
//         riskLevel: problem.riskLevel,
//         description: problem.description,
//         images: Object.values(req.files || {})
//           .flat()
//           .filter((f) => f.fieldname === `issueImages_${index}`)
//           .map((f) => f.path),
//         pdfMarks: (problem.pdfMarks || []).map((m) => ({
//           pageIndex: m.pageIndex,
//           x: m.x,
//           y: m.y,
//           color,
//         })),
//       };
//     });

//     const issue = await Issue.create({
//       ...baseData,
//       structureProblems,
//     });

//     res.status(201).json({
//       message: "Issue created successfully",
//       issue,
//     });
//   } catch (error) {
//     console.error("Create Issue Error:", error.message);
//     res.status(400).json({ message: error.message });
//   }
// };


// /**
//  * GET ALL ISSUES (Manager)
//  */
// exports.getAllIssues = async (req, res) => {
//   try {
//     const issues = await Issue.find()
//       .populate("reportedBy", "email floorNumber officeNumber")
//       .sort({ createdAt: -1 });

//     res.json(issues);
//   } catch (error) {
//     console.error("Get Issues Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const Issue = require("../models/Issue");
const FloorPlan = require("../models/FloorPlan");

/**
 * Helper: derive color from issueType
 * (backend safety – frontend already handles this)
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
      baseFloorPlan: floorPlan.planPdf, // ✅ FIXED
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
 * ✅ NEW: MANAGER ADD PHOTOS TO A SPOT
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
 * ✅ NEW: MANAGER ADD PHOTOS TO A SPOT
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