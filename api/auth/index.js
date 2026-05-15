import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../axios';

// ─── Register ─────────────────────────────────────────────────────────────────
// Route: POST /api/auth/register
// Joi schema expects: { name, email, password, confirmPassword }
// User model expects: { firstName, lastName, email, password }
// So: Joi strip karta hai extra fields, phir controller firstName/lastName chahta hai
// Solution: name ko split karke DONO bhejo — Joi "name" rakhega, model firstName/lastName use karega
export const registerUser = async ({ name, email, password, confirmPassword }) => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  // Agar sirf ek word hai toh lastName same rakho (min 2 chars backend mein required)
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];

  const response = await apiClient.post('/auth/register', {
    name,           // Joi validation ke liye
    firstName,      // User model ke liye
    lastName,       // User model ke liye
    email,
    password,
    confirmPassword,
  });

  const { token, user } = response.data.data;
  await AsyncStorage.setItem('accessToken', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));

  return response.data;
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', { email, password });

  const { token, user } = response.data.data;
  await AsyncStorage.setItem('accessToken', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));

  return response.data;
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    await AsyncStorage.multiRemove(['accessToken', 'user']);
  }
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data.data;
};

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = async ({ oldPassword, newPassword }) => {
  const response = await apiClient.put('/auth/change-password', {
    oldPassword,
    newPassword,
  });
  return response.data;
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post(`/auth/reset-password/${token}`, {
    password: newPassword,
  });
  return response.data;
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = async (token) => {
  const response = await apiClient.get(`/auth/verify-email/${token}`);
  return response.data;
};

// ─── Local Helpers ────────────────────────────────────────────────────────────
export const getStoredUser = async () => {
  const str = await AsyncStorage.getItem('user');
  return str ? JSON.parse(str) : null;
};

export const getStoredToken = async () => {
  return await AsyncStorage.getItem('accessToken');
};