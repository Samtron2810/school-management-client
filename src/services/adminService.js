import api, { unwrap } from "./api";

// Admin-level management endpoints:
//   GET   /dashboard        (role-scoped; admin dashboard for admins)
//   GET   /users            (list all users)
//   POST  /users            (create a user: admin/teacher/student/parent)
//   GET   /users/:id
//   PATCH /users/:id        (profile fields + role)
//   PATCH /users/:id/status (activate/deactivate; cannot target yourself)
//   PATCH /users/:id/password (admin reset; cannot target yourself; signs the
//                              user out everywhere server-side)
export const adminService = {
  getDashboard: () => unwrap(api.get("/dashboard")),
  getUsers: (params) => unwrap(api.get("/users", { params })),
  // payload: { firstName, lastName, username, email, password,
  //            role: "admin"|"teacher"|"student"|"parent", phoneNumber? }
  createUser: (payload) => unwrap(api.post("/users", payload)),
  getUser: (id) => unwrap(api.get(`/users/${id}`)),
  // payload: { firstName?, lastName?, otherName?, username?, email?,
  //            phoneNumber?, role? }
  updateUser: (id, payload) => unwrap(api.patch(`/users/${id}`, payload)),
  // payload: { isActive: boolean }
  updateUserStatus: (id, payload) =>
    unwrap(api.patch(`/users/${id}/status`, payload)),
  // payload: { newPassword }
  resetUserPassword: (id, payload) =>
    unwrap(api.patch(`/users/${id}/password`, payload)),
};

export default adminService;
