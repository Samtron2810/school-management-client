import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL, TOKEN_KEY } from "../utils/constants";
import { getStorageItem, removeStorageItem } from "../utils/storage";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStorageItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeStorageItem(TOKEN_KEY);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    toast.error(message);

    return Promise.reject(error);
  },
);

export default api;
