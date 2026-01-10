// const Issue = require("../models/Issue");

// exports.floorAnalytics = async (req, res) => {
//   try {
//     const floorNumber = Number(req.params.floorNumber);

//     const issues = await Issue.find({ floorNumber });

//     let totalProblems = 0;

//     const issueTypeStats = {};
//     const structureStats = {};
//     const problemHistory = {};

//     issues.forEach(issue => {
//       issue.structureProblems.forEach(problem => {
//         totalProblems++;

//         // Issue Type Count
//         issueTypeStats[problem.issueType] =
//           (issueTypeStats[problem.issueType] || 0) + 1;

//         // Structure Count
//         structureStats[problem.structureType] =
//           (structureStats[problem.structureType] || 0) + 1;

//         // Repetition tracking
//         const key = `${problem.structureType}-${problem.issueType}-${problem.direction}`;

//         if (!problemHistory[key]) {
//           problemHistory[key] = {
//             count: 1,
//             lastReported: issue.createdAt
//           };
//         } else {
//           problemHistory[key].count += 1;
//           if (issue.createdAt > problemHistory[key].lastReported) {
//             problemHistory[key].lastReported = issue.createdAt;
//           }
//         }
//       });
//     });

//     const repeatedProblems = Object.entries(problemHistory)
//       .filter(([_, v]) => v.count > 1)
//       .map(([k, v]) => ({
//         key: k,
//         count: v.count,
//         lastReported: v.lastReported
//       }));

//     res.json({
//       floorNumber,
//       totalIssues: issues.length,
//       totalProblems,
//       issueTypeStats,
//       structureStats,
//       repeatedProblems
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const Issue = require("../models/Issue");

exports.getFloorAnalytics = async (req, res) => {
  try {
    const floorNumber = Number(req.params.floorNumber);

    const issues = await Issue.find({ floorNumber })
      .sort({ createdAt: -1 })
      .lean();

    /* ================= SUMMARY ================= */

    const summary = {
      totalIssues: issues.length,
      totalProblems: 0,
      issueTypeStats: {},
      structureStats: {}
    };

    /* ================= ISSUE DETAILS ================= */

    const issueDetails = [];

    /* ================= REPEAT MAP ================= */

    const repeatMap = {};

    for (const issue of issues) {
      const problems = [];

      for (const p of issue.structureProblems || []) {
        summary.totalProblems++;

        // Issue type stats
        summary.issueTypeStats[p.issueType] =
          (summary.issueTypeStats[p.issueType] || 0) + 1;

        // Structure stats
        summary.structureStats[p.structureType] =
          (summary.structureStats[p.structureType] || 0) + 1;

        // Repetition key
        const key = `${p.structureType}_${p.direction}_${p.issueType}`;

        if (!repeatMap[key]) {
          repeatMap[key] = {
            structureType: p.structureType,
            direction: p.direction,
            issueType: p.issueType,
            count: 0,
            lastReported: issue.createdAt
          };
        }

        repeatMap[key].count += 1;

        if (issue.createdAt > repeatMap[key].lastReported) {
          repeatMap[key].lastReported = issue.createdAt;
        }

        problems.push({
          structureType: p.structureType,
          direction: p.direction,
          issueType: p.issueType,
          riskLevel: p.riskLevel
        });
      }

      issueDetails.push({
        issueId: issue._id,
        officeNumber: issue.officeNumber,
        status: issue.status,
        reportedAt: issue.createdAt,
        problems
      });
    }

    /* ================= REPEATED PROBLEMS ================= */

    const repeatedProblems = Object.values(repeatMap).filter(
      (r) => r.count > 1
    );

    /* ================= FINAL RESPONSE ================= */

    res.json({
      floorNumber,
      summary,
      issues: issueDetails,
      repeatedProblems
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Analytics generation failed" });
  }
};
