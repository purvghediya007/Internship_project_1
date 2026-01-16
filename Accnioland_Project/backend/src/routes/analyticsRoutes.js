// // const express = require("express");
// // const router = express.Router();

// // const authMiddleware = require("../middleware/authMiddleware");
// // const { managerOnly } = require("../middleware/roleMiddleware");
// // const { floorAnalytics } = require("../controllers/analyticsController");

// // router.get(
// //   "/floor/:floorNumber",
// //   authMiddleware,
// //   managerOnly,
// //   floorAnalytics
// // );

// // module.exports = router;

// const express = require("express");
// const router = express.Router();

// const authMiddleware = require("../middleware/authMiddleware");
// const { managerOnly } = require("../middleware/roleMiddleware");
// const { getFloorAnalytics } = require("../controllers/analyticsController");

// // MANAGER → FLOOR ANALYTICS
// router.get(
//   "/floor/:floorNumber",
//   authMiddleware,
//   managerOnly,
//   getFloorAnalytics
// );

// module.exports = router;
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { managerOnly } = require("../middleware/roleMiddleware");

const {
  getDashboardSummary,
  getFloorAnalyticsDetailed,
} = require("../controllers/analyticsController");

// Dashboard summary (filters by query)
router.get("/summary", authMiddleware, managerOnly, getDashboardSummary);

// Detailed floor analytics
router.get("/floor/:floorNumber", authMiddleware, managerOnly, getFloorAnalyticsDetailed);

module.exports = router;
