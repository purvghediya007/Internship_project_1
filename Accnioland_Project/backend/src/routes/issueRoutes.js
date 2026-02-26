const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { managerOnly } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const {
  createIssue,
  getAllIssues,
  addSpotPhotos,     // ✅ NEW
  deleteSpotPhoto,   // ✅ NEW

  getMyIssues,
  resolveStructureProblem,
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

    // 🔥 dynamic multi-structure images (worker side)
    { name: "issueImages_0", maxCount: 10 },
    { name: "issueImages_1", maxCount: 10 },
    { name: "issueImages_2", maxCount: 10 },
    { name: "issueImages_3", maxCount: 10 },
    { name: "issueImages_4", maxCount: 10 },
  ]),
  createIssue
);

/* =========================================================
   🆕 WORKER → GET MY ISSUE HISTORY
   GET /api/issues/my
========================================================= */
router.get(
  "/my",
  authMiddleware,
  getMyIssues
);

/* =========================================================
   🆕 WORKER → RESOLVE A STRUCTURE (SPOT)
   PATCH /api/issues/:issueId/spot/:spotIndex/resolve
========================================================= */
router.patch(
  "/:issueId/spot/:spotIndex/resolve",
  authMiddleware,
  upload.fields([
    { name: "resolutionImages", maxCount: 10 }
  ]),
  resolveStructureProblem
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
    { name: "issueImages_10", maxCount: 10 },
    { name: "issueImages_11", maxCount: 10 },
    { name: "issueImages_12", maxCount: 10 },
    { name: "issueImages_13", maxCount: 10 },
    { name: "issueImages_14", maxCount: 10 },
    { name: "issueImages_15", maxCount: 10 },
    { name: "issueImages_16", maxCount: 10 },
    { name: "issueImages_17", maxCount: 10 },
    { name: "issueImages_18", maxCount: 10 },
    { name: "issueImages_19", maxCount: 10 },
  ]),
  addSpotPhotos
);

/**
 * ✅ MANAGER → DELETE A SINGLE PHOTO FROM A SPOT
 * DELETE /api/issues/:issueId/spot/:spotIndex/photo
 * Body: { photoUrl: "https://..." }
 */
router.delete(
  "/:issueId/spot/:spotIndex/photo",
  authMiddleware,
  managerOnly,
  deleteSpotPhoto
);

module.exports = router;
