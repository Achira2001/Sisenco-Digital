import apiClient from "./axiosClient";

export const getProjectsApi = (params) => apiClient.get("/projects", { params });
export const createProjectApi = (data) => apiClient.post("/projects", data);
export const updateProjectApi = (id, data) => apiClient.put(`/projects/${id}`, data);
export const deleteProjectApi = (id) => apiClient.delete(`/projects/${id}`);
