const User = require("../models/User");

// @route  GET /api/users
// @access Private (manager only)
// Lists all team members, for the User Management page and dropdown filters.
const getUsers = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === "true" ? {} : { isActive: true };

    const users = await User.find(filter).sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/users
// @access Private (manager only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "manager" ? "manager" : "member",
    });

    // Never send the password hash back
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/users/:id/role
// @access Private (manager only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["member", "manager"].includes(role)) {
      return res.status(400).json({ message: 'Role must be "member" or "manager"' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/users/:id/status
// @access Private (manager only)
const setUserActiveStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ _id: user._id, name: user.name, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUserRole, setUserActiveStatus };