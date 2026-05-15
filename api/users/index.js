import apiClient from '../axios';

// ─────────────────────────────────────────────────────────────────────────────
// User Routes — sab protected hain (Bearer token required)
// ─────────────────────────────────────────────────────────────────────────────

// GET /users — Admin only
export const getAllUsers = async (params = {}) => {
  const response = await apiClient.get('/users', { params });
  return response.data;
};

// GET /users/:id
export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data;
};

// PUT /users/:id
export const updateUser = async (id, data) => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data.data;
};

// DELETE /users/:id — Admin only
export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

// PATCH /users/:id/role — Admin only
export const updateUserRole = async (id, role) => {
  const response = await apiClient.patch(`/users/${id}/role`, { role });
  return response.data;
};

// PATCH /users/:id/deactivate — Admin only
export const deactivateUser = async (id) => {
  const response = await apiClient.patch(`/users/${id}/deactivate`);
  return response.data;
};

// PATCH /users/:id/activate — Admin only
export const activateUser = async (id) => {
  const response = await apiClient.patch(`/users/${id}/activate`);
  return response.data;
};