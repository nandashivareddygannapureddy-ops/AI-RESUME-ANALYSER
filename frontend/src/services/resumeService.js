import api from "../lib/axios";

const resumeService = {
  // Upload resume file
  async upload(file) {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Analyze resume with ATS and JD matching
  async analyze({ file, resumeText, role, jdText }) {
    if (file) {
      const formData = new FormData();
      formData.append("resume", file);
      if (role) formData.append("role", role);
      if (jdText) formData.append("jdText", jdText);
      if (resumeText) formData.append("resumeText", resumeText);

      const res = await api.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    const res = await api.post("/resume/analyze", {
      resumeText,
      role,
      jdText,
    });
    return res.data;
  },

  // Get all uploaded resumes for current user
  async getResumes() {
    const res = await api.get("/resume");
    return res.data;
  },

  // Get single resume details
  async getResumeById(id) {
    const res = await api.get(`/resume/${id}`);
    return res.data;
  },

  // Delete resume
  async deleteResume(id) {
    const res = await api.delete(`/resume/${id}`);
    return res.data;
  },

  // Update resume
  async updateResume(id, data) {
    const res = await api.put(`/resume/${id}`, data);
    return res.data;
  },
};

export default resumeService;
