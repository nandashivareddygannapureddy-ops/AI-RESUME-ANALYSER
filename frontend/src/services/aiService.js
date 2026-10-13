import api from "../lib/axios";

const aiService = {
  // Analyze ATS compatibility
  async analyzeATS(resumeText) {
    const res = await api.post("/resume/analyze", { resumeText });
    return res.data;
  },

  // Match resume with job description
  async matchJD(resumeText, jobDescription) {
    const res = await api.post("/jd/match", { resumeText, jobDescription });
    return res.data;
  },

  // Generate interview questions
  async generateInterview(params) {
    const res = await api.post("/interview/generate", params);
    return res.data;
  },
};

export default aiService;
