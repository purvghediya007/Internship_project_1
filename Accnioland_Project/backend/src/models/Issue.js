const mongoose = require("mongoose");

/* ================= SUB-SCHEMAS ================= */

// PDF mark for a structure problem
const pdfMarkSchema = new mongoose.Schema(
  {
    pageIndex: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    color: {
      type: String,
      enum: ["red", "blue", "green", "brown", "pink", "black"],
      required: true,
    },
  },
  { _id: false }
);

const structureProblemSchema = new mongoose.Schema(
  {
    structureType: {
      type: String,
      enum: ["wall", "beam", "column", "roof", "floor", "facade", "other"],
      required: true,
    },

    direction: {
      type: String,
      enum: [
        "north",
        "south",
        "east",
        "west",
        "north-east",
        "north-west",
        "south-east",
        "south-west",
      ],
      required: true,
    },

    issueType: {
      type: String,
      enum: [
        "crack",
        "dampness",
        "crack_dampness",
        "leakage",
        "dampness_leakage",
        "other",
      ],
      required: true,
    },

    crackType: {
      type: String,
      enum: ["minor", "medium", "severe"],
    },

    dampnessLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: function () {
        return (
          this.issueType === "dampness" ||
          this.issueType === "crack_dampness" ||
          this.issueType === "dampness_leakage"
        );
      },
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    description: { type: String, required: true },

    images: [{ type: String, required: true }],

    pdfMarks: { type: [pdfMarkSchema], default: [] },

    status: {
      type: String,
      enum: ["in_progress", "resolved"],
      default: "in_progress",
    },

    resolution: 
    {
      description: String,
      images: [String],
      resolvedAt: Date,
      resolvedBy: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    }


  },
  { _id: false }
);


// const pdfMarkSchema = new mongoose.Schema(
//   {
//     pageIndex: {
//       type: Number,
//       required: true,
//     },
//     x: {
//       type: Number,
//       required: true,
//     },
//     y: {
//       type: Number,
//       required: true,
//     },
//     color: {
//       type: String,
//       enum: ["red", "blue", "green", "black"],
//       required: true,
//     },
//   },
//   { _id: false }
// );

// // Each structural problem reported
// const structureProblemSchema = new mongoose.Schema(
//   {
//     structureType: {
//       type: String,
//       enum: ["wall", "beam", "column", "roof", "floor", "facade", "other"],
//       required: true,
//     },

//     direction: {
//       type: String,
//       enum: ["north", "south", "east", "west"],
//       required: true,
//     },

//     issueType: {
//       type: String,
//       enum: ["crack", "dampness", "crack_dampness", "leakage","dampness_leakage","other"],
//       required: true,
//     },

//     crackType: {
//       type: String,
//       enum: ["minor", "medium", "severe"],
//     },

//     dampnessLevel: {
//       type: String,
//       enum: ["low", "medium", "high"],
//       required: function () {
//         return this.issueType === "dampness" || this.issueType === "crack_dampness" || this.issueType === "leakage" || this.issueType === "dampness_leakage" ;
//       },
//     },


//     riskLevel: {
//       type: String,
//       enum: ["low", "medium", "high"],
//       required: true,
//     },

//     description: {
//       type: String,
//       required: true,
//     },

//     images: [
//       {
//         type: String,
//         required: true,
//       },
//     ],

//     pdfMarks: {
//       type: [pdfMarkSchema],
//       default: [],
//     },
//   },
//   { _id: false }
// );

/* ================= MAIN ISSUE SCHEMA ================= */

const issueSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    floorNumber: {
      type: Number,
      required: true,
    },

    officeNumber: {
      type: Number,
      required: true,
    },

    // Manager uploaded
    baseFloorPlan: {
      type: String,
      required: true,
    },

    // Office worker uploaded
    markedFloorPlan: {
      type: String,
      required: true,
    },

    isAnnotatedFromBase: {
      type: Boolean,
      default: true,
    },

    /**
     * 🔒 BACKWARD SAFETY:
     * Old single-issue fields are NOT removed yet.
     * They can be deprecated later safely.
     */

    wallDirection: {
      type: String,
      enum: ["north", "south", "east", "west","north-west","north-east","south-east","south-west"],
    },

    wallLocationRef: {
      type: String,
    },

    description: {
      type: String,
    },

    issueImage: {
      type: String,
    },

    /**
     * 🔥 NEW STRUCTURED WAY (MULTIPLE PROBLEMS)
     */
    structureProblems: {
      type: [structureProblemSchema],
      default: [],
    },

    // status: {
    //   type: String,
    //   enum: ["open", "in_progress", "resolved"],
    //   default: "open",
    // },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Issue", issueSchema);
