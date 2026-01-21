// // const express = require("express");
// // const router = express.Router();

// // const authMiddleware = require("../middleware/authMiddleware");
// // const { managerOnly } = require("../middleware/roleMiddleware");
// // const upload = require("../middleware/upload");

// // const {
// //   createIssue,
// //   getAllIssues, // ✅ CORRECT NAME
// // } = require("../controllers/issueController");

// // // OFFICE WORKER → CREATE ISSUE
// // router.post(
// //   "/create",
// //   authMiddleware,
// //   upload.fields([
// //   // legacy single image (still supported)
// //   { name: "issueImage", maxCount: 1 },

// //   // required edited PDF
// //   { name: "markedFloorPlan", maxCount: 1 },

// //   // 🔥 dynamic multi-structure images
// //   { name: "issueImages_0", maxCount: 10 },
// //   { name: "issueImages_1", maxCount: 10 },
// //   { name: "issueImages_2", maxCount: 10 },
// //   { name: "issueImages_3", maxCount: 10 },
// //   { name: "issueImages_4", maxCount: 10 },
// // ]),
// //   createIssue
// // );



// // // MANAGER → VIEW ALL ISSUES
// // router.get(
// //   "/all",
// //   authMiddleware,
// //   managerOnly,
// //   getAllIssues // ✅ FUNCTION EXISTS
// // );

// // module.exports = router;
// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/authMiddleware");
// const { managerOnly } = require("../middleware/roleMiddleware");
// const upload = require("../middleware/upload");

// const {
//   createIssue,
//   getAllIssues,
//   addSpotPhotos, // ✅ NEW CONTROLLER
// } = require("../controllers/issueController");

// // OFFICE WORKER → CREATE ISSUE
// router.post(
//   "/create",
//   authMiddleware,
//   upload.fields([
//     // legacy single image (still supported)
//     { name: "issueImage", maxCount: 1 },

//     // required edited PDF
//     { name: "markedFloorPlan", maxCount: 1 },

//     // 🔥 dynamic multi-structure images
//     { name: "issueImages_0", maxCount: 10 },
//     { name: "issueImages_1", maxCount: 10 },
//     { name: "issueImages_2", maxCount: 10 },
//     { name: "issueImages_3", maxCount: 10 },
//     { name: "issueImages_4", maxCount: 10 },
//   ]),
//   createIssue
// );

// // MANAGER → VIEW ALL ISSUES
// router.get("/all", authMiddleware, managerOnly, getAllIssues);

// /**
//  * ✅ MANAGER → ADD PHOTOS TO A SPECIFIC SPOT
//  * URL: PATCH /api/issues/:issueId/spot/:spotIndex/add-photos
//  *
//  * This will upload images and push them into:
//  * structureProblems[spotIndex].images[]
//  */
// router.patch(
//   "/:issueId/spot/:spotIndex/add-photos",
//   authMiddleware,
//   managerOnly,
//   upload.any(), // ✅ accept any field name (issueImages_0, issueImages_1, etc.)
//   addSpotPhotos
// );

// module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { managerOnly } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const {
  createIssue,
  getAllIssues,
  addSpotPhotos, // ✅ NEW
} = require("../controllers/issueController");

// OFFICE WORKER → CREATE ISSUE
router.post(
  "/create",
  authMiddleware,
  upload.fields([
    // legacy single image (still supported)
    { name: "issueImage", maxCount: 1 },

    // required edited PDF
    { name: "markedFloorPlan", maxCount: 1 },

    // 🔥 dynamic multi-structure images
    { name: "issueImages_0", maxCount: 10 },
    { name: "issueImages_1", maxCount: 10 },
    { name: "issueImages_2", maxCount: 10 },
    { name: "issueImages_3", maxCount: 10 },
    { name: "issueImages_4", maxCount: 10 },
  ]),
  createIssue
);

// MANAGER → VIEW ALL ISSUES
router.get("/all", authMiddleware, managerOnly, getAllIssues);

/**
 * ✅ MANAGER → ADD PHOTOS TO A SPECIFIC SPOT
 * PATCH /api/issues/:issueId/spot/:spotIndex/add-photos
 */
router.patch(
  "/:issueId/spot/:spotIndex/add-photos",
  authMiddleware,
  managerOnly,
  upload.fields([
    { name: "issueImages_0", maxCount: 10 },
    { name: "issueImages_1", maxCount: 10 },
    { name: "issueImages_2", maxCount: 10 },
    { name: "issueImages_3", maxCount: 10 },
    { name: "issueImages_4", maxCount: 10 },
    { name: "issueImages_5", maxCount: 10 },
    { name: "issueImages_6", maxCount: 10 },
    { name: "issueImages_7", maxCount: 10 },
    { name: "issueImages_8", maxCount: 10 },
    { name: "issueImages_9", maxCount: 10 },
  ]),
  addSpotPhotos
);

module.exports = router;
