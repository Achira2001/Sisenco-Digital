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

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

router.use(protect); 


router.get("/mine", getMyReports);


router.get("/", authorize("manager"), getAllReports);


router.post(
  "/",
  [
    body("project").notEmpty().withMessage("Project is required"),
    body("weekStartDate").isISO8601().withMessage("Valid weekStartDate is required"),
    body("weekEndDate").isISO8601().withMessage("Valid weekEndDate is required"),
  ],
  checkValidation,
  createReport
);


router.get("/:id", getReportById);


router.put("/:id", updateReport);


router.post("/:id/submit", submitReport);


router.post(
  "/:id/review",
  authorize("manager"),
  [body("action").isIn(["approve", "request_changes"]).withMessage("Invalid review action")],
  checkValidation,
  reviewReport
);

module.exports = router;
