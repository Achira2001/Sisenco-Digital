const express = require("express");
const { body, validationResult } = require("express-validator");
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// Check if the request data is valid
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  next();
};

// Register a new user
// POST /api/auth/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  checkValidation,
  registerUser
);

// Login user
// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  checkValidation,
  loginUser
);

// Get logged-in user
// GET /api/auth/me
router.get("/me", protect, getMe);

module.exports = router;