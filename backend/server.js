const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const mongoose = require("mongoose");

dotenv.config();

require("./src/config/passport");
const connectDB = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/auth.routes");
const resumeRoutes = require("./src/routes/resume.routes");
const historyRoutes = require("./src/routes/history.routes");
const jdRoutes = require("./src/routes/jd.routes");
const interviewRoutes = require("./src/routes/interview.routes");
const linkedinRoutes = require("./src/routes/linkedin.routes");

// Middleware
const { errorHandler, notFound } = require("./src/middleware/errorHandler");
const { apiLimiter } = require("./src/middleware/rateLimiter");

const app = express();

// Trust proxy for Vercel and reverse proxy environments
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// CORS configuration for local and deployed environments (Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      // Allow if explicit match, vercel preview domain, or development mode
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(passport.initialize());

// Static uploads if local
if (!process.env.VERCEL) {
  app.use("/uploads", express.static("uploads"));
}

// Auto-connect DB middleware for serverless invocations
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && process.env.MONGO_URI) {
    try {
      await connectDB();
    } catch (err) {
      // continue execution, error will be logged
    }
  }
  next();
});

// Apply rate limiter to /api
app.use("/api", apiLimiter);

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    message: "RozgaarAI Backend is running 🚀",
    status: "healthy",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "RozgaarAI API is live 🚀",
    status: "healthy",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/linkedin", linkedinRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Only listen if not running in Vercel Serverless environment
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;