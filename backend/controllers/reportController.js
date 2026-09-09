const Report = require("../models/Report");


const EDITABLE_STATUSES = ["draft", "needs_correction"];


const extractContentFields = (body) => {
  const { tasksCompleted, tasksPlannedNextWeek, blockers, achievements, hoursByType, notes } =
    body;
  return { tasksCompleted, tasksPlannedNextWeek, blockers, achievements, hoursByType, notes };
};

const createReport = async (req, res) => {
  try {
    const { project, weekStartDate, weekEndDate } = req.body;

    const report = await Report.create({
      user: req.user._id, 
      project,
      weekStartDate,
      weekEndDate,
      ...extractContentFields(req.body),
      status: "draft",
    });

    res.status(201).json(report);
  } catch (error) {
    if (error.code === 11000) {

      return res
        .status(400)
        .json({ message: "You already have a report for this project and week" });
    }
    res.status(500).json({ message: error.message });
  }
};


const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }


    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own reports" });
    }

    if (!EDITABLE_STATUSES.includes(report.status)) {
      return res.status(400).json({
        message: `Report cannot be edited while status is "${report.status}"`,
      });
    }

    Object.assign(report, extractContentFields(req.body));

    const updated = await report.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only submit your own reports" });
    }

    if (!EDITABLE_STATUSES.includes(report.status)) {
      return res.status(400).json({
        message: `Report cannot be submitted while status is "${report.status}"`,
      });
    }

    const nextVersionNumber = report.currentVersionNumber + 1;

    report.versions.push({
      versionNumber: nextVersionNumber,
      submittedAt: new Date(),
      tasksCompleted: report.tasksCompleted,
      tasksPlannedNextWeek: report.tasksPlannedNextWeek,
      blockers: report.blockers,
      achievements: report.achievements,
      hoursByType: report.hoursByType,
      notes: report.notes,
      reviewAction: "pending",
    });

    report.currentVersionNumber = nextVersionNumber;
    report.status = "submitted";

    report.latestReviewComment = "";

    const updated = await report.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyReports = async (req, res) => {
  try {
    const { status, project, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (project) filter.project = project;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("project", "name")
        .sort({ weekStartDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(filter),
    ]);

    res.json({ reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAllReports = async (req, res) => {
  try {
    const {
      status,
      project,
      user, 
      weekStart, 
      weekEnd, 
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (project) filter.project = project;
    if (user) filter.user = user;
    if (weekStart || weekEnd) {
      filter.weekStartDate = {};
      if (weekStart) filter.weekStartDate.$gte = new Date(weekStart);
      if (weekEnd) filter.weekStartDate.$lte = new Date(weekEnd);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("user", "name email")
        .populate("project", "name")
        .sort({ weekStartDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(filter),
    ]);

    res.json({ reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user", "name email")
      .populate("project", "name")
      .populate("versions.reviewedBy", "name")
      .populate("latestReviewedBy", "name");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const isOwner = report.user._id.toString() === req.user._id.toString();
    const isManager = req.user.role === "manager";

    if (!isOwner && !isManager) {
      return res.status(403).json({ message: "You are not allowed to view this report" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const reviewReport = async (req, res) => {
  try {
    const { action, comment } = req.body; 

    if (!["approve", "request_changes"].includes(action)) {
      return res.status(400).json({ message: 'Action must be "approve" or "request_changes"' });
    }

    if (action === "request_changes" && !comment?.trim()) {
      return res
        .status(400)
        .json({ message: "A comment is required when requesting changes" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status !== "submitted") {
      return res.status(400).json({
        message: `Only reports with status "submitted" can be reviewed (this one is "${report.status}")`,
      });
    }


    const latestVersion = report.versions[report.versions.length - 1];
    latestVersion.reviewedBy = req.user._id;
    latestVersion.reviewedAt = new Date();

    if (action === "approve") {
      latestVersion.reviewAction = "approved";
      report.status = "approved";
      report.latestReviewComment = "";
    } else {
      latestVersion.reviewAction = "changes_requested";
      latestVersion.reviewComment = comment.trim();
      report.status = "needs_correction";
      report.latestReviewComment = comment.trim(); 
    }

    report.latestReviewedBy = req.user._id;
    report.latestReviewedAt = new Date();

    const updated = await report.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  updateReport,
  submitReport,
  getMyReports,
  getAllReports,
  getReportById,
  reviewReport,
};
