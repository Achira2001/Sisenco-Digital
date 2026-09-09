const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register a new user
// POST /api/auth/register
// Public route
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    // Create the new user 
    const user = await User.create({
      name,
      email,
      password,
      role: role === "manager" ? "manager" : "member",
    });

    // Send user details and login token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Login user
// POST /api/auth/login
// Public route
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user and include the hidden password field
    const user = await User.findOne({ email }).select("+password");

    // Check if the email and password are correct
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if the user account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "This account has been deactivated",
      });
    }

    // Send user details and login token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get the currently logged-in user
// GET /api/auth/me
// Private route
const getMe = async (req, res) => {
  // User data is added by the auth middleware
  res.json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};