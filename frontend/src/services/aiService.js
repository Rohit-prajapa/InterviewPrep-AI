import api from "./api";

export const generateQuestions = async (data) => {
  const response = await api.post("/ai/generate-questions", data);
  return response.data;
};

export const evaluateAnswer = async (data) => {
  const response = await api.post("/ai/evaluate-answer", data);
  return response.data;
};

export const generateAdaptiveQuestion = async (data) => {
  const response = await api.post("/ai/adaptive-question", data);
  return response.data;
};