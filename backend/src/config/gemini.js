const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const geminiModel = genAI
  ? genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
  : null;

module.exports = geminiModel;