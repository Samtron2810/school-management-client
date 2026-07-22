import api, { unwrap } from "./api";

// Admin-level endpoints actually exposed by the backend:
//   GET  /dashboard  (role-scoped; returns the admin dashboard for admins)
//   GET  /users      (list all users)
//   POST /users      (create a user: admin/teacher/student/parent)
// NOTE: the backend has no PATCH/DELETE for users yet.
export const adminService = {
  getDashboard: () => unwrap(api.get("/dashboard")),
  getUsers: (params) => unwrap(api.get("/users", { params })),
  // payload: { firstName, lastName, username, email, password,
  //            role: "admin"|"teacher"|"student"|"parent", phoneNumber? }
  createUser: (payload) => unwrap(api.post("/users", payload)),
};

export default adminService;
