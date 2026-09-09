const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid or expired token",
    });
  }
};

// Role authorization
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This action requires role: ${allowedRoles.join(
          " or "
        )}`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};