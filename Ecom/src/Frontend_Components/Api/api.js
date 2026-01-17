// Frontend_Components/Api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",  
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (data) => api.post("/auth/register", data);  
export const loginUser = (data) => api.post("/auth/login", data);
export const sendOTP = (email) => api.post("/auth/send-otp", { email });
export const verifyOTP = (email, otp) => api.post("/auth/verify-otp", { email, otp });
export const getOTPExpiry = (email) => api.get(`/auth/otp-expiry?email=${encodeURIComponent(email)}`);

export default api;
