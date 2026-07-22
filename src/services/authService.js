import { jwtDecode } from "jwt-decode";
import api, { unwrap } from "./api";
import { CSRF_KEY, TOKEN_KEY, USER_KEY } from "../utils/constants";
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "../utils/storage";

// Backend users expose firstName/lastName/fullName, not `name` — normalize so
// the UI (Header greeting, avatars) can rely on `user.name`.
function normalizeUser(user) {
  if (!user || typeof user !== "object") return user;
  const name =
    user.name ||
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name && name !== user.name ? { ...user, name } : user;
}

function persistSession(data = {}) {
  const token = data.token || data.accessToken;
  let user = data.user || null;

  // Fallback: derive the user from the JWT payload (mock tokens aren't JWTs).
  if (!user && token && !token.startsWith("mock-")) {
    try {
      user = jwtDecode(token);
    } catch {
      user = null;
    }
  }
  user = normalizeUser(user);

  if (token) setStorageItem(TOKEN_KEY, token);
  if (user) setStorageItem(USER_KEY, user);
  if (data.csrfToken) setStorageItem(CSRF_KEY, data.csrfToken);

  return { token, user };
}

export function getStoredUser() {
  return getStorageItem(USER_KEY);
}

export function getStoredToken() {
  return getStorageItem(TOKEN_KEY);
}

export function isTokenExpired(token = getStoredToken()) {
  if (!token) return true;

  // Mock sessions aren't JWTs — only issued when VITE_MOCK_AUTH is enabled
  // (development only), so treat them as valid here.
  if (token.startsWith("mock-")) return false;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

// Mock login fallback is only allowed while developing without a backend.
// Enable it by setting VITE_MOCK_AUTH=true in .env.development.
// Production builds (import.meta.env.DEV === false) can never mock auth.
function shouldUseMockAuth() {
  return import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === "true";
}

// Backend POST /auth/login expects { identifier, password }
// (identifier = email OR username) and responds
// { success, statusCode, message, data: { user, accessToken, csrfToken } }.
export async function login(credentials = {}) {
  const identifier = credentials.identifier || credentials.email;

  try {
    const payload = await unwrap(
      api.post(
        "/auth/login",
        { identifier, password: credentials.password },
        { skipErrorToast: true, skipAuthHandling: true },
      ),
    );
    return persistSession(payload);
  } catch (err) {
    if (!shouldUseMockAuth()) {
      throw err; // Real behavior: let the caller handle the failed login.
    }

    // --- Development-only mock session (backend not implemented yet) ---
    let role = "admin";
    if (identifier?.toLowerCase().includes("teacher")) role = "teacher";
    else if (identifier?.toLowerCase().includes("student")) role = "student";
    else if (identifier?.toLowerCase().includes("parent")) role = "parent";

    const mockUser = {
      id: "1",
      name: identifier ? identifier.split("@")[0] : "Admin User",
      email: identifier || "admin@school.com",
      role: role,
    };
    const mockToken = "mock-jwt-token-" + Date.now();
    return persistSession({ token: mockToken, user: mockUser });
  }
}

// GET /auth/me → data: <User doc>
export async function me() {
  const user = await unwrap(api.get("/auth/me", { skipAuthHandling: true }));
  if (user) {
    const normalized = normalizeUser(user);
    setStorageItem(USER_KEY, normalized);
    return normalized;
  }
  return user;
}

// POST /auth/logout — best effort: blacklist the token server-side,
// but always clear the local session afterwards.
export async function logout() {
  try {
    await api.post("/auth/logout", null, {
      skipErrorToast: true,
      skipAuthHandling: true,
    });
  } catch {
    // Ignore: local session is cleared below regardless.
  } finally {
    removeStorageItem(TOKEN_KEY);
    removeStorageItem(USER_KEY);
    removeStorageItem(CSRF_KEY);
  }
}

// PATCH /auth/change-password — invalidates other server sessions,
// so the local session is cleared too (user must log in again).
export async function changePassword({ currentPassword, newPassword }) {
  const result = await unwrap(
    api.patch("/auth/change-password", { currentPassword, newPassword }),
  );
  removeStorageItem(TOKEN_KEY);
  removeStorageItem(USER_KEY);
  removeStorageItem(CSRF_KEY);
  return result;
}

// NOTE: this backend has no /auth/register, /auth/forgot-password,
// /auth/reset-password or /auth/verify-otp endpoints. Accounts are created
// by admins via adminService.createUser (POST /users).

export default {
  changePassword,
  getStoredToken,
  getStoredUser,
  isTokenExpired,
  login,
  logout,
  me,
};
