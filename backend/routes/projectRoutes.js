const express = require("express");

const { body, validationResult } = require("express-validator");

const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

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

// All routes require login
router.use(protect);

// Get all projects
router.get("/", getProjects);

// Create a project - manager only
router.post(
  "/",
  authorize("manager"),
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  checkValidation,
  createProject
);

// Update a project - manager only
router.put("/:id", authorize("manager"), updateProject);

// Delete a project - manager only
router.delete("/:id", authorize("manager"), deleteProject);

module.exports = router;