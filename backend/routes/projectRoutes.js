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

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};


router.use(protect);


router.get("/", getProjects);


router.post(
  "/",
  authorize("manager"),
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  checkValidation,
  createProject
);


router.put("/:id", authorize("manager"), updateProject);


router.delete("/:id", authorize("manager"), deleteProject);

module.exports = router;
