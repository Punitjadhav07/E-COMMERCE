// Frontend_Components/Api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",  // ← fixed to /api prefix
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (data) => api.post("/auth/register", data);  // ← /api/auth/register
export const loginUser = (data) => api.post("/auth/login", data);        // ← /api/auth/login

export default api;
