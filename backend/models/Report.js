const mongoose = require("mongoose");

// Task completed schema
const taskCompletedSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    plannedPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    actualPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "blocked"],
      default: "not_started",
    },

    timePlannedHours: {
      type: Number,
      min: 0,
      default: 0,
    },

    timeSpentHours: {
      type: Number,
      min: 0,
      default: 0,
    },

    deliverable: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

// Blocker schema
const blockerSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    isKeyIssue: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Achievement schema
const achievementSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },

    isKeyAchievement: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Hours worked by task type
const hoursByTypeSchema = new mongoose.Schema(
  {
    development: {
      type: Number,
      min: 0,
      default: 0,
    },

    testing: {
      type: Number,
      min: 0,
      default: 0,
    },

    meetings: {
      type: Number,
      min: 0,
      default: 0,
    },

    documentation: {
      type: Number,
      min: 0,
      default: 0,
    },

    other: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

// Common report content fields
const reportContentFields = {
  tasksCompleted: [taskCompletedSchema],

  tasksPlannedNextWeek: [
    {
      type: String,
      trim: true,
    },
  ],

  blockers: [blockerSchema],

  achievements: [achievementSchema],

  hoursByType: {
    type: hoursByTypeSchema,
    default: () => ({}),
  },

  notes: {
    type: String,
    trim: true,
    default: "",
  },
};

// Report version schema
const versionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },

    submittedAt: {
      type: Date,
      required: true,
    },

    // Save the report content 
    ...reportContentFields,

    // Review result 
    reviewAction: {
      type: String,
      enum: ["pending", "approved", "changes_requested"],
      default: "pending",
    },

    reviewComment: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },
  },
  { _id: false }
);

// Main report schema
const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    weekStartDate: {
      type: Date,
      required: true,
    },

    weekEndDate: {
      type: Date,
      required: true,
    },

    // Current report content
    ...reportContentFields,

    // Current report status
    status: {
      type: String,
      enum: ["draft", "submitted", "needs_correction", "approved"],
      default: "draft",
    },

    // Latest review information
    latestReviewComment: {
      type: String,
      trim: true,
      default: "",
    },

    latestReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    latestReviewedAt: {
      type: Date,
    },

    // 0 means the report has not been submitted yet
    currentVersionNumber: {
      type: Number,
      default: 0,
    },

    // Stores all submitted versions
    versions: [versionSchema],
  },

  { timestamps: true }
);

// Prevent duplicate reports for the same user, project and week
reportSchema.index(
  { user: 1, project: 1, weekStartDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("Report", reportSchema);