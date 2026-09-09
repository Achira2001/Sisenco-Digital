const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    }, // data stored inside the token
    process.env.JWT_SECRET, // secret key used to sign it
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

module.exports = generateToken;