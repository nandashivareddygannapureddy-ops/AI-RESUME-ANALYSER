import api from "../lib/axios";

const authService = {
  async register(data) {
    // data: { name, email, password }
    const res = await api.post("/auth/register", data);
    return res.data; // { success, accessToken, user }
  },

  async login(data) {
    // data: { email, password }
    const res = await api.post("/auth/login", data);
    return res.data; // { success, accessToken, user }
  },

  async getProfile() {
    const res = await api.get("/auth/profile");
    return res.data; // { success, user }
  },

  async updateProfile(data) {
    // data: { name, avatar }
    const res = await api.put("/auth/profile", data);
    return res.data; // { success, user }
  },

  async googleLogin(data) {
    // data: { credential } or { profile }
    const res = await api.post("/auth/google", data);
    return res.data; // { success, accessToken, user }
  },

  async getGoogleStatus() {
    const res = await api.get("/auth/google/status");
    return res.data; // { success, hasCredentials }
  },

  async saveGoogleCredentials(credentials) {
    const res = await api.post("/auth/google/credentials", credentials);
    return res.data;
  },
};

export default authService;