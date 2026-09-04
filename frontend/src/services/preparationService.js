import api from "./api";

export const generatePreparationPlan = async () => {
  const response = await api.post("/preparation/generate");
  return response.data;
};

export const getPreparationPlan = async () => {
  const response = await api.get("/preparation");
  return response.data;
};

export const updatePreparationPlan = async (id, data) => {
  const response = await api.put(`/preparation/${id}`, data);
  return response.data;
};