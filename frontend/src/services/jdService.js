import api from "../lib/axios";

const jdService = {
  // Match resume with job description
  async matchJD(resumeText, jobDescription) {
    const res = await api.post("/jd/match", {
      resumeText,
      jobDescription,
    });
    return res.data;
  },

  // Calculate skill gap between resume and JD
  async getSkillGap(resumeText, jobDescription) {
    const res = await api.post("/jd/skillgap", {
      resumeText,
      jobDescription,
    });
    return res.data;
  },
};

export default jdService;
