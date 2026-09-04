import api from "./api";

export const createInterview = async (data) => {
  const response = await api.post("/interviews", data);
  return response.data;
};

export const getInterviews = async () => {
  const response = await api.get("/interviews");
  return response.data;
};

export const getInterviewById = async (id) => {
  const response = await api.get(`/interviews/${id}`);
  return response.data;
};

export const updateInterview = async (id, data) => {
  const response = await api.put(`/interviews/${id}`, data);
  return response.data;
};

export const completeInterview = async (id, overallScore) => {
  const response = await api.patch(`/interviews/${id}/complete`, {
    overallScore,
  });

  return response.data;
};