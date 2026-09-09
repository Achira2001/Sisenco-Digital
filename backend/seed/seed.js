require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Project = require("../models/Project");
const Report = require("../models/Report");

// Get Monday of a week
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diffToMonday);

  return d;
};

// Get Monday from a previous week
const weeksAgo = (n) => {
  const d = new Date();

  d.setDate(d.getDate() - n * 7);

  return getMonday(d);
};

// Add days to a date
const addDays = (date, days) => {
  const d = new Date(date);

  d.setDate(d.getDate() + days);

  return d;
};

// Create sample report content
const buildContent = (personName, projectName, weekIndex) => ({
  tasksCompleted: [
    {
      taskName: `Implement ${projectName} feature batch ${weekIndex}`,
      priority: "high",
      plannedPercent: 100,
      actualPercent: 90,
      status: "completed",
      timePlannedHours: 12,
      timeSpentHours: 14,
      deliverable: "Merged pull request",
    },
    {
      taskName: `Fix bugs reported in ${projectName}`,
      priority: "medium",
      plannedPercent: 100,
      actualPercent: 100,
      status: "completed",
      timePlannedHours: 5,
      timeSpentHours: 4,
      deliverable: "Bug fix deployed",
    },
  ],

  tasksPlannedNextWeek: [
    `Continue ${projectName} work`,
    "Attend sprint planning",
  ],

  blockers: [
    {
      description: `Waiting on design assets for ${projectName}`,
      isKeyIssue: true,
    },
  ],

  achievements: [
    {
      description: `${personName} shipped the ${projectName} update on time`,
      isKeyAchievement: true,
    },
  ],

  hoursByType: {
    development: 20,
    testing: 6,
    meetings: 4,
    documentation: 2,
    other: 1,
  },

  notes: "No additional notes this week.",
});

const run = async () => {
  await connectDB();

  // Clear old data
  console.log("Clearing existing data...");

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Report.deleteMany({}),
  ]);

  // Create manager
  console.log("Creating users...");

  const manager = await User.create({
    name: "Nirmal Perera",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
  });

  // Create team members
  const memberDefs = [
    {
      name: "Sanduni Fernando",
      email: "sanduni@example.com",
    },
    {
      name: "Kasun Silva",
      email: "kasun@example.com",
    },
    {
      name: "Nadeesha Wickrama",
      email: "nadeesha@example.com",
    },
    {
      name: "Tharindu Jayasinghe",
      email: "tharindu@example.com",
    },
  ];

  const members = [];

  for (const def of memberDefs) {
    const user = await User.create({
      name: def.name,
      email: def.email,
      password: "password123",
      role: "member",
    });

    members.push(user);
  }

  // Create projects
  console.log("Creating projects...");

  const projectDefs = [
    "Client A",
    "Internal Tooling",
    "R&D",
    "Marketing",
  ];

  const projects = [];

  for (const name of projectDefs) {
    const project = await Project.create({
      name,
      description: `${name} project`,
      createdBy: manager._id,
      members: members.map((member) => member._id),
    });

    projects.push(project);
  }

  // Create reports
  console.log("Creating reports...");

  for (let m = 0; m < members.length; m++) {
    const member = members[m];
    const project = projects[m % projects.length];

    // Week 3: Approved
    const week3Start = weeksAgo(3);
    const content3 = buildContent(
      member.name,
      project.name,
      1
    );

    await Report.create({
      user: member._id,
      project: project._id,
      weekStartDate: week3Start,
      weekEndDate: addDays(week3Start, 6),
      ...content3,
      status: "approved",
      currentVersionNumber: 1,
      latestReviewComment: "",
      latestReviewedBy: manager._id,
      latestReviewedAt: addDays(week3Start, 8),

      versions: [
        {
          versionNumber: 1,
          submittedAt: addDays(week3Start, 7),
          ...content3,
          reviewAction: "approved",
          reviewedBy: manager._id,
          reviewedAt: addDays(week3Start, 8),
        },
      ],
    });

    // Week 2: Changes requested, then resubmitted
    const week2Start = weeksAgo(2);

    const content2v1 = buildContent(
      member.name,
      project.name,
      2
    );

    const content2v2 = {
      ...content2v1,
      notes:
        "Updated after manager feedback: added missing deliverable links.",
    };

    await Report.create({
      user: member._id,
      project: project._id,
      weekStartDate: week2Start,
      weekEndDate: addDays(week2Start, 6),
      ...content2v2,
      status: "submitted",
      currentVersionNumber: 2,
      latestReviewComment: "",

      versions: [
        {
          versionNumber: 1,
          submittedAt: addDays(week2Start, 7),
          ...content2v1,
          reviewAction: "changes_requested",
          reviewComment:
            "Please add the deliverable links for each completed task before I can approve this.",
          reviewedBy: manager._id,
          reviewedAt: addDays(week2Start, 8),
        },
        {
          versionNumber: 2,
          submittedAt: addDays(week2Start, 9),
          ...content2v2,
          reviewAction: "pending",
        },
      ],
    });

    // Week 1: Submitted and waiting for review
    const week1Start = weeksAgo(1);

    const content1 = buildContent(
      member.name,
      project.name,
      3
    );

    await Report.create({
      user: member._id,
      project: project._id,
      weekStartDate: week1Start,
      weekEndDate: addDays(week1Start, 6),
      ...content1,
      status: "submitted",
      currentVersionNumber: 1,

      versions: [
        {
          versionNumber: 1,
          submittedAt: addDays(week1Start, 6),
          ...content1,
          reviewAction: "pending",
        },
      ],
    });

    // Current week: Draft
    // Skip the last member to show "not started"
    if (m !== members.length - 1) {
      const week0Start = weeksAgo(0);

      const content0 = buildContent(
        member.name,
        project.name,
        4
      );

      await Report.create({
        user: member._id,
        project: project._id,
        weekStartDate: week0Start,
        weekEndDate: addDays(week0Start, 6),
        ...content0,
        status: "draft",
      });
    }
  }

  // Show login details
  console.log(
    "\nSeed complete! All passwords: password123"
  );

  console.log(`Manager: ${manager.email}`);

  members.forEach((member) => {
    console.log(`Member: ${member.email}`);
  });

  await mongoose.disconnect();

  process.exit(0);
};

// Handle errors
run().catch((error) => {
  console.error("Seeding failed:", error);

  process.exit(1);
});