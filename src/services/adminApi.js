import axiosClient from './axiosClient';

const adminApi = {
  // Auth
  login: (data) => axiosClient.post('/auth/login', data),
  getMe: () => axiosClient.get('/auth/me'),

  // Dashboard
  getDashboard: () => axiosClient.get('/admin/dashboard'),

  // Groups
  getAllGroups: () => axiosClient.get('/admin/groups'),
  getGroupDetail: (id) => axiosClient.get(`/admin/groups/${id}`),
  getGroupMessages: (id, page = 1) => axiosClient.get(`/admin/groups/${id}/messages?page=${page}&limit=50`),
  deleteGroup: (id) => axiosClient.delete(`/admin/groups/${id}`),
  addMember: (groupId, data) => axiosClient.post(`/admin/groups/${groupId}/members`, data),
  removeMember: (groupId, userId) => axiosClient.delete(`/admin/groups/${groupId}/members/${userId}`),

  // Messages
  deleteMessage: (id) => axiosClient.delete(`/admin/messages/${id}`),

  // Users
  getAllUsers: (params) => axiosClient.get('/admin/users', { params }),
  createUser: (data) => axiosClient.post('/admin/users', data),
  updateUser: (id, data) => axiosClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
};

export default adminApi;
