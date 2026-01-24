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

// Admin API calls
export const setAuthToken = (userId) => {
  if (userId) {
    api.defaults.headers.common['x-user-id'] = userId;
  } else {
    delete api.defaults.headers.common['x-user-id'];
  }
};

export const getPendingSellers = () => api.get("/admin/pending-sellers");
export const approveSeller = (id) => api.post(`/admin/approve-seller/${id}`);
export const rejectSeller = (id) => api.post(`/admin/reject-seller/${id}`);
export const getAllUsers = () => api.get("/admin/users");
export const blockUser = (id) => api.post(`/admin/block-user/${id}`);
export const deleteUser = (id) => api.delete(`/admin/user/${id}`);

// Product API calls
export const getMyProducts = () => api.get("/products/seller/my-products");
export const getAllProducts = () => api.get("/products");
export const getProductById = (id) => api.get(`/products/${id}`);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Special function for file upload (uses FormData)
export const createProduct = (formData) => {
  return api.post("/products", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
