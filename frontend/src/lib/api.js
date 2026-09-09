import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

// Resolve a media/artist URL (external http URL or backend-relative /api/files path)
export const mediaSrc = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vec_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
