import api from "./api";

// Get complete analytics
export const getAnalytics = async () => {
  const response = await api.get("/analytics");
  return response.data;
};

// Get performance analytics
export const getPerformance = async () => {
  const response = await api.get("/analytics/performance");
  return response.data;
};

// Get score trend
export const getScoreTrend = async () => {
  const response = await api.get("/analytics/trend");
  return response.data;
};