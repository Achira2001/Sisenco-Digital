// Seed script: fills the database with realistic demo data so the
// dashboard and report pages have something meaningful to show.
//
// Run it with: npm run seed   (defined in package.json)
//
// It creates:
//  - 1 manager + 4 team members (all with password: "password123")
//  - 4 projects
//  - reports for the last 4 weeks per member, in different statuses,
//    so every status (draft, submitted, needs_correction, approved) and
//    the "not started" case are all represented on the dashboard.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Report = require("../models/Report");

// Same "find the Monday of the week" helper used by the dashboard, so seeded
// report weeks line up correctly with dashboard week filters.
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diffToMonday);
  return d;
};

const weeksAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return getMonday(d);
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Builds one fake but realistic set of report content fields.
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
  tasksPlannedNextWeek: [`Continue ${projectName} work`, "Attend sprint planning"],
  blockers: [
    { description: `Waiting on design assets for ${projectName}`, isKeyIssue: true },
  ],
  achievements: [
    { description: `${personName} shipped the ${projectName} update on time`, isKeyAchievement: true },
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

  console.log("Clearing existing data...");
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Report.deleteMany({})]);

  console.log("Creating users...");
  const manager = await User.create({
    name: "Nirmal Perera",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
  });

  const memberDefs = [
    { name: "Sanduni Fernando", email: "sanduni@example.com" },
    { name: "Kasun Silva", email: "kasun@example.com" },
    { name: "Nadeesha Wickrama", email: "nadeesha@example.com" },
    { name: "Tharindu Jayasinghe", email: "tharindu@example.com" },
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

  console.log("Creating projects...");
  const projectDefs = ["Client A", "Internal Tooling", "R&D", "Marketing"];
  const projects = [];
  for (const name of projectDefs) {
    const project = await Project.create({
      name,
      description: `${name} project`,
      createdBy: manager._id,
      members: members.map((m) => m._id),
    });
    projects.push(project);
  }

  console.log("Creating reports...");

  // For each member, create 4 weeks of reports:
  //   week -3 : approved
  //   week -2 : needs_correction (manager sent it back, with a comment)
  //   week -1 : submitted (waiting for manager review)
  //   week  0 : draft (still being written) - except one member has NO
  //             report at all this week, to demo the "not started" case
  for (let m = 0; m < members.length; m++) {
    const member = members[m];
    const project = projects[m % projects.length];

    // --- Week -3: Approved ---
    const week3Start = weeksAgo(3);
    const content3 = buildContent(member.name, project.name, 1);
    const report3 = await Report.create({
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

    // --- Week -2: Needs Correction -> resubmitted -> now Submitted again ---
    // This report demonstrates the FULL version history: v1 was sent back
    // with a comment, the member fixed it, and v2 is now awaiting review.
    const week2Start = weeksAgo(2);
    const content2v1 = buildContent(member.name, project.name, 2);
    const content2v2 = {
      ...content2v1,
      notes: "Updated after manager feedback: added missing deliverable links.",
    };
    const report2 = await Report.create({
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
          reviewComment: "Please add the deliverable links for each completed task before I can approve this.",
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

    // --- Week -1: Submitted, waiting for first review ---
    const week1Start = weeksAgo(1);
    const content1 = buildContent(member.name, project.name, 3);
    const report1 = await Report.create({
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

    // --- Week 0 (current week): Draft, except skip one member entirely ---
    // so the dashboard also shows a "not started" case.
    if (m !== members.length - 1) {
      const week0Start = weeksAgo(0);
      const content0 = buildContent(member.name, project.name, 4);
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

  console.log("\nSeed complete! Login credentials (all passwords: password123):");
  console.log(`  Manager : ${manager.email}`);
  members.forEach((m) => console.log(`  Member  : ${m.email}`));

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
