const express = require("express");

const { body, validationResult } = require("express-validator");

const {
  createReport,
  updateReport,
  submitReport,
  getMyReports,
  getAllReports,
  getReportById,
  reviewReport,
} = require("../controllers/reportController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Check validation errors
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  next();
};

// All report routes require login
router.use(protect);

// Get logged-in user's reports
router.get("/mine", getMyReports);

// Get all reports - manager only
router.get("/", authorize("manager"), getAllReports);

// Create a new report
router.post(
  "/",
  [
    body("project").notEmpty().withMessage("Project is required"),
    body("weekStartDate")
      .isISO8601()
      .withMessage("Valid weekStartDate is required"),
    body("weekEndDate")
      .isISO8601()
      .withMessage("Valid weekEndDate is required"),
  ],
  checkValidation,
  createReport
);

// Get one report
router.get("/:id", getReportById);

// Update a report
router.put("/:id", updateReport);

// Submit or resubmit a report
router.post("/:id/submit", submitReport);

// Review a report - manager only
router.post(
  "/:id/review",
  authorize("manager"),
  [
    body("action")
      .isIn(["approve", "request_changes"])
      .withMessage("Invalid review action"),
  ],
  checkValidation,
  reviewReport
);

module.exports = router;