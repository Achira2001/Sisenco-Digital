import apiClient from "./axiosClient";

export const createReportApi = (data) => apiClient.post("/reports", data);
export const updateReportApi = (id, data) => apiClient.put(`/reports/${id}`, data);
export const submitReportApi = (id) => apiClient.post(`/reports/${id}/submit`);
export const getMyReportsApi = (params) => apiClient.get("/reports/mine", { params });
export const getAllReportsApi = (params) => apiClient.get("/reports", { params });
export const getReportByIdApi = (id) => apiClient.get(`/reports/${id}`);
export const reviewReportApi = (id, data) => apiClient.post(`/reports/${id}/review`, data);
