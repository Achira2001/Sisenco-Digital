const mongoose = require("mongoose");

// Project schema
const projectSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);