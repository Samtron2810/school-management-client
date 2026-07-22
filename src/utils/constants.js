export const APP_NAME = "TronSchool";

export const USER_ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
};

export const TOKEN_KEY = "tronschool_token";
export const USER_KEY = "tronschool_user";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  ARCHIVED: "archived",
};
