import api, { unwrap } from "./api";

// Backend: /classes (admin only; GET is admin-only too).
export const classService = {
  // payload: { level: "Creche"|"Nursery"|"Primary"|"JSS"|"SSS",
  //            className, arm?, description? }
  create: (payload) => unwrap(api.post("/classes", payload)),
  list: (params) => unwrap(api.get("/classes", { params })),
  get: (id) => unwrap(api.get(`/classes/${id}`)),
  // payload: { level?, className?, arm?, description?, isActive? }
  update: (id, payload) => unwrap(api.patch(`/classes/${id}`, payload)),
  // Blocked server-side while enrollments/class-subjects reference the class.
  remove: (id) => unwrap(api.delete(`/classes/${id}`)),
};

export default classService;
