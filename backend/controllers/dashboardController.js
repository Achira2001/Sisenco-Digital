const Report = require("../models/Report");
const User = require("../models/User");
const Project = require("../models/Project");

// Get Monday and Sunday of a week
const getWeekRange = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    weekStart: monday,
    weekEnd: sunday,
  };
};

// Get dashboard summary for a week
const getSummary = async (req, res) => {
  try {
    const { weekStart, weekEnd } = getWeekRange(req.query.weekStart);

    const [activeMembers, reportsThisWeek] = await Promise.all([
      User.countDocuments({
        role: "member",
        isActive: true,
      }),

      Report.find({
        weekStartDate: {
          $gte: weekStart,
          $lte: weekEnd,
        },
      }),
    ]);

    // Count reports that were submitted or approved
    const submittedOrLater = reportsThisWeek.filter((report) =>
      ["submitted", "needs_correction", "approved"].includes(
        report.status
      )
    ).length;

    // Count reports needing corrections
    const needsCorrectionCount = reportsThisWeek.filter(
      (report) => report.status === "needs_correction"
    ).length;

    // Count approved reports
    const approvedCount = reportsThisWeek.filter(
      (report) => report.status === "approved"
    ).length;

    // Find members who created a report
    const membersWhoReported = new Set(
      reportsThisWeek.map((report) => report.user.toString())
    );

    // Members without a report are still pending
    const pendingCount = Math.max(
      activeMembers - membersWhoReported.size,
      0
    );

    // Count blockers from non-draft reports
    const openBlockers = reportsThisWeek
      .filter((report) => report.status !== "draft")
      .reduce(
        (total, report) => total + (report.blockers?.length || 0),
        0
      );

    // Calculate compliance percentage
    const complianceRate =
      activeMembers === 0
        ? 0
        : Math.round((submittedOrLater / activeMembers) * 100);

    res.json({
      weekStart,
      weekEnd,
      totalSubmittedThisWeek: submittedOrLater,
      approvedCount,
      needsCorrectionCount,
      pendingCount,
      complianceRatePercent: complianceRate,
      openBlockers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get completed task count for each week
const getTasksTrend = async (req, res) => {
  try {
    const numWeeks = Number(req.query.weeks) || 8;
    const { weekStart: currentWeekStart } = getWeekRange();

    const trend = [];

    for (let i = numWeeks - 1; i >= 0; i--) {
      const weekDate = new Date(currentWeekStart);

      weekDate.setDate(weekDate.getDate() - i * 7);

      const { weekStart, weekEnd } = getWeekRange(weekDate);

      const reports = await Report.find({
        weekStartDate: {
          $gte: weekStart,
          $lte: weekEnd,
        },
        status: {
          $ne: "draft",
        },
      });

      // Count completed tasks
      const completedTasks = reports.reduce(
        (total, report) =>
          total +
          report.tasksCompleted.filter(
            (task) => task.status === "completed"
          ).length,
        0
      );

      trend.push({
        weekStart: weekStart.toISOString().split("T")[0],
        completedTasks,
      });
    }

    res.json(trend);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get report status for each active member
const getStatusByMember = async (req, res) => {
  try {
    const { weekStart, weekEnd } = getWeekRange(
      req.query.weekStart
    );

    const [members, reports] = await Promise.all([
      User.find({
        role: "member",
        isActive: true,
      }).select("name email"),

      Report.find({
        weekStartDate: {
          $gte: weekStart,
          $lte: weekEnd,
        },
      }),
    ]);

    // Create a map of reports by user ID
    const reportByUser = new Map(
      reports.map((report) => [
        report.user.toString(),
        report,
      ])
    );

    const result = members.map((member) => {
      const report = reportByUser.get(
        member._id.toString()
      );

      return {
        userId: member._id,
        name: member.name,
        status: report ? report.status : "not_started",
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get task count for each project
const getWorkloadByProject = async (req, res) => {
  try {
    const filter = {
      status: {
        $ne: "draft",
      },
    };

    if (req.query.weekStart) {
      filter.weekStartDate = {
        $gte: new Date(req.query.weekStart),
      };
    }

    const reports = await Report.find(filter).populate(
      "project",
      "name"
    );

    // Store task count for each project
    const workloadMap = new Map();

    reports.forEach((report) => {
      const projectName = report.project?.name || "Unknown";
      const taskCount = report.tasksCompleted.length;

      workloadMap.set(
        projectName,
        (workloadMap.get(projectName) || 0) + taskCount
      );
    });

    const result = Array.from(workloadMap.entries()).map(
      ([project, taskCount]) => ({
        project,
        taskCount,
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get total hours by task type
const getTimeByTaskType = async (req, res) => {
  try {
    const reports = await Report.find({
      status: {
        $ne: "draft",
      },
    });

    const totals = {
      development: 0,
      testing: 0,
      meetings: 0,
      documentation: 0,
      other: 0,
    };

    reports.forEach((report) => {
      const hours = report.hoursByType || {};

      totals.development += hours.development || 0;
      totals.testing += hours.testing || 0;
      totals.meetings += hours.meetings || 0;
      totals.documentation += hours.documentation || 0;
      totals.other += hours.other || 0;
    });

    res.json(totals);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get recent report activity
const getActivityFeed = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const reports = await Report.find({
      status: {
        $ne: "draft",
      },
    })
      .populate("user", "name")
      .populate("project", "name")
      .sort({
        updatedAt: -1,
      })
      .limit(limit);

    const feed = reports.map((report) => ({
      reportId: report._id,
      userName: report.user?.name,
      projectName: report.project?.name,
      status: report.status,
      weekStartDate: report.weekStartDate,
      updatedAt: report.updatedAt,
    }));

    res.json(feed);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getSummary,
  getTasksTrend,
  getStatusByMember,
  getWorkloadByProject,
  getTimeByTaskType,
  getActivityFeed,
};