import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL, CSRF_KEY, TOKEN_KEY, USER_KEY } from "../utils/constants";
import { getStorageItem, removeStorageItem, setStorageItem } from "../utils/storage";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // server sets httpOnly accessToken/refreshToken/csrfToken cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate client (no interceptors) for the silent refresh — avoids interceptor recursion.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshSessionToken() {
  const csrfToken = getStorageItem(CSRF_KEY);
  const { data: envelope } = await refreshClient.post(
    "/auth/refresh-token",
    {},
    { headers: csrfToken ? { "x-csrf-token": csrfToken } : {} },
  );

  const payload = envelope?.data ?? envelope;
  if (payload?.accessToken) {
    setStorageItem(TOKEN_KEY, payload.accessToken);
    if (payload.csrfToken) setStorageItem(CSRF_KEY, payload.csrfToken);
    return payload.accessToken;
  }
  return null;
}

api.interceptors.request.use((config) => {
  const token = getStorageItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Mutations on this backend require the CSRF double-cookie header.
  const method = (config.method || "get").toLowerCase();
  if (!["get", "head", "options"].includes(method)) {
    const csrfToken = getStorageItem(CSRF_KEY);
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;

    // Auth handling: try one silent token refresh, otherwise clear session.
    // Callers can opt out with { skipAuthHandling: true } (e.g. login, logout).
    if (status === 401 && !config.skipAuthHandling) {
      if (!config._retriedWithRefresh) {
        config._retriedWithRefresh = true;
        try {
          const newToken = await refreshSessionToken();
          if (newToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${newToken}`;
            return api(config); // retry the original request once
          }
        } catch {
          // refresh failed — fall through to clearing the session
        }
      }

      removeStorageItem(TOKEN_KEY);
      removeStorageItem(USER_KEY);
      removeStorageItem(CSRF_KEY);

      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    // Callers can opt out (pass { skipErrorToast: true }) to render
    // their own error UI — avoids toast + inline error duplication.
    if (!config.skipErrorToast) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

// Every response on this API is wrapped as
// { success, statusCode, message, data } — this peels off the envelope.
// NOTE: list endpoints return either an array or { data: [], pagination }
// inside `data`, depending on the controller.
export const unwrap = (promise) =>
  promise.then((res) =>
    res?.data && typeof res.data === "object" && "data" in res.data
      ? res.data.data
      : res?.data,
  );

export default api;
