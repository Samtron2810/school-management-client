import api from "./api";

export const adminService = {
  getDashboard: () => api.get("/admin/dashboard").then((res) => res.data),
  getUsers: (params) => api.get("/admin/users", { params }).then((res) => res.data),
  createUser: (payload) => api.post("/admin/users", payload).then((res) => res.data),
  updateUser: (id, payload) =>
    api.put(`/admin/users/${id}`, payload).then((res) => res.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((res) => res.data),
};

export default adminService;
