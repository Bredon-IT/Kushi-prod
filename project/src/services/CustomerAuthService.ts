// src/services/CustomerAuthService.ts
import axios from "axios";
import Global_API_BASE from "./GlobalConstants";

const API_URL = Global_API_BASE + "/api/auth"; // update base URL if needed

// Login service
export const loginCustomer = async (email: string, password: string) => {
  return axios.post(`${API_URL}/signin`, { email, password });
};

// Signup service
export const signupCustomer = async (formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  return axios.post(`${API_URL}/signup`, formData);
};

// Fetch users (optional)
export const getAllUsers = async () => {
  return axios.get(`${API_URL}/users`);
};

// Forgot password service
export const forgotPassword = async (
  email: string,
  newPassword: string
) => {
  return axios.post(`${API_URL}/forgot-password`, { email, newPassword });
};

