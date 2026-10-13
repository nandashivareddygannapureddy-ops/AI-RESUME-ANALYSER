const express = require("express");
const router = express.Router();
const { upload } = require("../services/fileUpload.service");
const {
  uploadResume,
  analyzeResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
} = require("../controllers/resume.controller");
const { protect, optionalAuth } = require("../middleware/auth.middleware");

// File upload only
router.post("/upload", optionalAuth, upload.single("resume"), uploadResume);

// Full ATS analysis with optional file upload and optional auth tracking
router.post("/analyze", optionalAuth, upload.single("resume"), analyzeResume);

// Authenticated resume history & CRUD
router.get("/", protect, getResumes);
router.get("/:id", protect, getResumeById);
router.put("/:id", protect, updateResume);
router.delete("/:id", protect, deleteResume);

module.exports = router;