import api from "../lib/axios";

const interviewService = {
  // Generate interview prep questions
  async generate({ role, category, resumeText, jobDescription } = {}) {
    const res = await api.post("/interview/generate", {
      role,
      category,
      resumeText,
      jobDescription,
    });
    return res.data;
  },

  // Get saved questions by resume ID
  async getQuestions(resumeId) {
    const res = await api.get(`/interview/${resumeId}`);
    return res.data;
  },
};

export default interviewService;
