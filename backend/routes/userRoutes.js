const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  getUsers,
  createUser,
  updateUserRole,
  setUserActiveStatus,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

// Every route below requires: logged in AND role = manager
router.use(protect, authorize("manager"));

router.get("/", getUsers);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  checkValidation,
  createUser
);

router.put("/:id/role", updateUserRole);
router.put("/:id/status", setUserActiveStatus);

module.exports = router;