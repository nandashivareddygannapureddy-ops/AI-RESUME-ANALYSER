const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    fileName: {
      type: String,
      default: "resume.pdf",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    parsedText: {
      type: String,
      default: "",
    },
    parsedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    atsResult: {
      type: Object,
      default: {},
    },
    suggestions: [{ type: String }],
    status: {
      type: String,
      enum: ["uploaded", "parsed", "analyzed"],
      default: "uploaded",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", ResumeSchema);