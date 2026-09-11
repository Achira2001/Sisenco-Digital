import apiClient from "./axiosClient";

export const getSummaryApi = (params) =>
  apiClient.get("/dashboard/summary", { params });

export const getTasksTrendApi = (params) =>
  apiClient.get("/dashboard/tasks-trend", { params });

export const getStatusByMemberApi = (params) =>
  apiClient.get("/dashboard/status-by-member", { params });

export const getWorkloadByProjectApi = (params) =>
  apiClient.get("/dashboard/workload-by-project", { params });

export const getTimeByTaskTypeApi = () =>
  apiClient.get("/dashboard/time-by-tasktype");

export const getActivityFeedApi = (params) =>
  apiClient.get("/dashboard/activity-feed", { params });