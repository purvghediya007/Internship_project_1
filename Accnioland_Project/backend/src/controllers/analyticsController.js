// // const Issue = require("../models/Issue");

// // exports.floorAnalytics = async (req, res) => {
// //   try {
// //     const floorNumber = Number(req.params.floorNumber);

// //     const issues = await Issue.find({ floorNumber });

// //     let totalProblems = 0;

// //     const issueTypeStats = {};
// //     const structureStats = {};
// //     const problemHistory = {};

// //     issues.forEach(issue => {
// //       issue.structureProblems.forEach(problem => {
// //         totalProblems++;

// //         // Issue Type Count
// //         issueTypeStats[problem.issueType] =
// //           (issueTypeStats[problem.issueType] || 0) + 1;

// //         // Structure Count
// //         structureStats[problem.structureType] =
// //           (structureStats[problem.structureType] || 0) + 1;

// //         // Repetition tracking
// //         const key = `${problem.structureType}-${problem.issueType}-${problem.direction}`;

// //         if (!problemHistory[key]) {
// //           problemHistory[key] = {
// //             count: 1,
// //             lastReported: issue.createdAt
// //           };
// //         } else {
// //           problemHistory[key].count += 1;
// //           if (issue.createdAt > problemHistory[key].lastReported) {
// //             problemHistory[key].lastReported = issue.createdAt;
// //           }
// //         }
// //       });
// //     });

// //     const repeatedProblems = Object.entries(problemHistory)
// //       .filter(([_, v]) => v.count > 1)
// //       .map(([k, v]) => ({
// //         key: k,
// //         count: v.count,
// //         lastReported: v.lastReported
// //       }));

// //     res.json({
// //       floorNumber,
// //       totalIssues: issues.length,
// //       totalProblems,
// //       issueTypeStats,
// //       structureStats,
// //       repeatedProblems
// //     });

// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };
// const Issue = require("../models/Issue");

// exports.getFloorAnalytics = async (req, res) => {
//   try {
//     const floorNumber = Number(req.params.floorNumber);

//     const issues = await Issue.find({ floorNumber })
//       .sort({ createdAt: -1 })
//       .lean();

//     /* ================= SUMMARY ================= */

//     const summary = {
//       totalIssues: issues.length,
//       totalProblems: 0,
//       issueTypeStats: {},
//       structureStats: {}
//     };

//     /* ================= ISSUE DETAILS ================= */

//     const issueDetails = [];

//     /* ================= REPEAT MAP ================= */

//     const repeatMap = {};

//     for (const issue of issues) {
//       const problems = [];

//       for (const p of issue.structureProblems || []) {
//         summary.totalProblems++;

//         // Issue type stats
//         summary.issueTypeStats[p.issueType] =
//           (summary.issueTypeStats[p.issueType] || 0) + 1;

//         // Structure stats
//         summary.structureStats[p.structureType] =
//           (summary.structureStats[p.structureType] || 0) + 1;

//         // Repetition key
//         const key = `${p.structureType}_${p.direction}_${p.issueType}`;

//         if (!repeatMap[key]) {
//           repeatMap[key] = {
//             structureType: p.structureType,
//             direction: p.direction,
//             issueType: p.issueType,
//             count: 0,
//             lastReported: issue.createdAt
//           };
//         }

//         repeatMap[key].count += 1;

//         if (issue.createdAt > repeatMap[key].lastReported) {
//           repeatMap[key].lastReported = issue.createdAt;
//         }

//         problems.push({
//           structureType: p.structureType,
//           direction: p.direction,
//           issueType: p.issueType,
//           riskLevel: p.riskLevel
//         });
//       }

//       issueDetails.push({
//         issueId: issue._id,
//         officeNumber: issue.officeNumber,
//         status: issue.status,
//         reportedAt: issue.createdAt,
//         problems
//       });
//     }

//     /* ================= REPEATED PROBLEMS ================= */

//     const repeatedProblems = Object.values(repeatMap).filter(
//       (r) => r.count > 1
//     );

//     /* ================= FINAL RESPONSE ================= */

//     res.json({
//       floorNumber,
//       summary,
//       issues: issueDetails,
//       repeatedProblems
//     });

//   } catch (error) {
//     console.error("Analytics Error:", error);
//     res.status(500).json({ message: "Analytics generation failed" });
//   }
// };
const Issue = require("../models/Issue");
const getConnection = require("../config/dbManager");
/**
 * GET /api/analytics/summary
 * Optional query:
 *   ?floor=2
 *   ?date=2026-01-15
 *   ?status=open
 *   ?risk=high
 */
exports.getDashboardSummary = async (req, res) => {

  const connection = await getConnection(req.user.building);
  const IssueDB = connection.model("Issue", Issue.schema);
  try {
    const { floor, date, status, risk } = req.query;

    const filter = {};

    // floor filter
    if (floor) filter.floorNumber = Number(floor);

    // status filter
    if (status) filter.status = status;

    // risk filter (inside structureProblems)
    if (risk) filter["structureProblems.riskLevel"] = risk;

    // date filter (createdAt range for one day)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.createdAt = { $gte: start, $lte: end };
    }

    // Fetch issues
    const issues = await IssueDB.find(filter).lean();

    // Total issues
    const totalIssues = issues.length;

    // Total structure problems
    let totalProblems = 0;

    // Status counts
    const statusStats = {
      open: 0,
      in_progress: 0,
      resolved: 0,
    };

    // Risk stats
    const riskStats = {
      low: 0,
      medium: 0,
      high: 0,
    };

    // Issue type stats
    const issueTypeStats = {};

    // Structure stats
    const structureStats = {};

    // Floor stats
    const floorStats = {};

    issues.forEach((issue) => {
      // status
      const s = issue.status || "open";
      if (statusStats[s] !== undefined) statusStats[s]++;
      else statusStats.open++;

      // floor stats
      const f = issue.floorNumber;
      floorStats[f] = (floorStats[f] || 0) + 1;

      // problems
      const problems = issue.structureProblems || [];
      totalProblems += problems.length;

      problems.forEach((p) => {
        // risk
        if (p.riskLevel) {
          riskStats[p.riskLevel] = (riskStats[p.riskLevel] || 0) + 1;
        }

        // issue type
        if (p.issueType) {
          issueTypeStats[p.issueType] = (issueTypeStats[p.issueType] || 0) + 1;
        }

        // structure type
        if (p.structureType) {
          structureStats[p.structureType] =
            (structureStats[p.structureType] || 0) + 1;
        }
      });
    });

    res.json({
      summary: {
        totalIssues,
        totalProblems,
        statusStats,
        riskStats,
        issueTypeStats,
        structureStats,
        floorStats,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/analytics/floor/:floorNumber
 * Returns your "detailed structure" like you wanted
 */
exports.getFloorAnalyticsDetailed = async (req, res) => {

  const connection = await getConnection(req.user.building);
  const IssueDB = connection.model("Issue", Issue.schema);
  try {
    const floorNumber = Number(req.params.floorNumber);

    const issues = await IssueDB.find({ floorNumber })
      .sort({ createdAt: -1 })
      .lean();

    const summary = {
      totalIssues: issues.length,
      totalProblems: 0,
      issueTypeStats: {},
      structureStats: {},
    };

    // Repeated problems detection map
    const repeatMap = {}; // key -> {count, lastReported}

    const issueList = issues.map((issue) => {
      const problems = issue.structureProblems || [];
      summary.totalProblems += problems.length;

      problems.forEach((p) => {
        // issueType stats
        if (p.issueType) {
          summary.issueTypeStats[p.issueType] =
            (summary.issueTypeStats[p.issueType] || 0) + 1;
        }

        // structure stats
        if (p.structureType) {
          summary.structureStats[p.structureType] =
            (summary.structureStats[p.structureType] || 0) + 1;
        }

        // repeated key
        const key = `${p.structureType}_${p.direction}_${p.issueType}`;

        if (!repeatMap[key]) {
          repeatMap[key] = {
            structureType: p.structureType,
            direction: p.direction,
            issueType: p.issueType,
            count: 1,
            lastReported: issue.createdAt,
          };
        } else {
          repeatMap[key].count += 1;
          if (new Date(issue.createdAt) > new Date(repeatMap[key].lastReported)) {
            repeatMap[key].lastReported = issue.createdAt;
          }
        }
      });

      return {
        issueId: issue._id,
        officeNumber: issue.officeNumber,
        status: issue.status || "open",
        reportedAt: issue.createdAt,
        problems: problems.map((p) => ({
          structureType: p.structureType,
          direction: p.direction,
          issueType: p.issueType,
          riskLevel: p.riskLevel,
        })),
      };
    });

    const repeatedProblems = Object.values(repeatMap)
      .filter((x) => x.count >= 2)
      .sort((a, b) => b.count - a.count);

    res.json({
      floorNumber,
      summary,
      issues: issueList,
      repeatedProblems,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
