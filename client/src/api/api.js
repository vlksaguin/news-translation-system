import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const DIALECTS = ["tl", "ceb", "ilo", "hil", "war", "pam"];

export const translateText = async (text, targetLanguage = "tl") => {
  // response contains src|tgt|translated text after api/translate
  const response = await axios.post(`${API_URL}/api/translate`, {
    text,
    sourceLanguage: "en",
    targetLanguage,
  });

  return response.data.translation;
};

export const translateTextBatch = async (text, targetLanguages = DIALECTS) => {
  const response = await axios.post(`${API_URL}/api/translate/batch`, {
    text,
    sourceLanguage: "en",
    targetLanguages,
  });

  return response.data.results;
};

export const getSupportedLanguages = async () => {
  const response = await axios.get(`${API_URL}/api/translate/languages`);
  return response.data.languages || [];
};