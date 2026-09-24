// frontend/src/api/userApi.js
import api from './axios';

// ============================================
// USER API - Semua fungsi untuk mengelola user
// ============================================

/**
 * GET ALL USERS (tanpa statistik) - Admin Only
 * Endpoint: GET /api/users/
 * Query params: ?role=admin&search=budi
 */
export const getAllUsers = (params = {}) => {
  return api.get('/users', { params });
};

/**
 * GET ALL USERS WITH STATISTICS - Admin Only
 * Menampilkan semua user + total orders, paid, spent
 * Endpoint: GET /api/users/admin/all-with-stats
 * Query params: ?role=admin&search=budi
 */
export const getAllUsersWithStats = (params = {}) => {
  return api.get('/users/admin/all-with-stats', { params });
};

/**
 * GET USER BY ID (tanpa statistik)
 * Endpoint: GET /api/users/:id
 */
export const getUserById = (userId) => {
  return api.get(`/users/${userId}`);
};

/**
 * GET USER WITH STATISTICS
 * Admin bisa lihat semua, user lain cuma diri sendiri
 * Endpoint: GET /api/users/:id/with-stats
 */
export const getUserWithStats = (userId) => {
  return api.get(`/users/${userId}/with-stats`);
};

/**
 * CREATE NEW USER - Admin Only
 * Endpoint: POST /api/users/
 * Body: { name, email, password, phone, role }
 */
export const createUser = (userData) => {
  return api.post('/users', userData);
};

/**
 * UPDATE USER - Admin Only
 * Endpoint: PUT /api/users/:id
 * Body: { name, phone, role, is_active, password }
 */
export const updateUser = (userId, userData) => {
  return api.put(`/users/${userId}`, userData);
};

/**
 * UPDATE USER STATUS (Active/Inactive) - Admin Only
 * Endpoint: PATCH /api/users/:id/status
 * Body: { is_active: true/false }
 */
export const updateUserStatus = (userId, isActive) => {
  return api.patch(`/users/${userId}/status`, { is_active: isActive });
};

/**
 * DELETE USER - Admin Only
 * Endpoint: DELETE /api/users/:id
 */
export const deleteUser = (userId) => {
  return api.delete(`/users/${userId}`);
};

// ============================================
// DEFAULT EXPORT (opsional)
// ============================================
const userApi = {
  getAllUsers,
  getAllUsersWithStats,
  getUserById,
  getUserWithStats,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
};

export default userApi;