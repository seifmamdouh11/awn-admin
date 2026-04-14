import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-5ee0.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to automatically inject adminToken
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global auth handling (401/Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
