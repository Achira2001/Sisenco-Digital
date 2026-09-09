import apiClient from "./axiosClient";

export const getUsersApi = (params) => apiClient.get("/users", { params });
export const createUserApi = (data) => apiClient.post("/users", data);
export const updateUserRoleApi = (id, role) => apiClient.put(`/users/${id}/role`, { role });
export const setUserActiveStatusApi = (id, isActive) =>
  apiClient.put(`/users/${id}/status`, { isActive });
