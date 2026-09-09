const express = require("express");
const {
  getSummary,
  getTasksTrend,
  getStatusByMember,
  getWorkloadByProject,
  getTimeByTaskType,
  getActivityFeed,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("manager"));

router.get("/summary", getSummary);
router.get("/tasks-trend", getTasksTrend);
router.get("/status-by-member", getStatusByMember);
router.get("/workload-by-project", getWorkloadByProject);
router.get("/time-by-tasktype", getTimeByTaskType);
router.get("/activity-feed", getActivityFeed);

module.exports = router;
