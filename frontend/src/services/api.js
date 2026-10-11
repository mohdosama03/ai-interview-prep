import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aip_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handling — bounce back to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("aip_token");
      localStorage.removeItem("aip_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getDashboard: () => api.get("/users/dashboard"),
};

export const questionAPI = {
  list: (params) => api.get("/questions", { params }),
  getById: (id) => api.get(`/questions/${id}`),
  toggleSave: (id) => api.post(`/questions/${id}/save`),
};

export const interviewAPI = {
  create: (data) => api.post("/interviews", data),
  list: () => api.get("/interviews"),
  getById: (id) => api.get(`/interviews/${id}`),
  submitAnswer: (id, data) => api.post(`/interviews/${id}/answer`, data),
  complete: (id) => api.post(`/interviews/${id}/complete`),
};

export const feedbackAPI = {
  forInterview: (interviewId) => api.get(`/feedback/${interviewId}`),
};

export default api;
