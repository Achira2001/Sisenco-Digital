require("dotenv").config(); // Load .env variables
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Global middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" })); // Allow frontend requests
app.use(express.json()); // Read JSON data
app.use(morgan("dev")); // Show requests in the console

// Check if the server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Weekly Report API is running" });
});

// Application routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

// Handle server errors
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong on the server",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});