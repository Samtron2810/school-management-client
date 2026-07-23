import api, { unwrap } from "./api";

// Backend: /sessions. Reads are open to every signed-in role (dropdowns);
// writes are admin-only.
export const sessionService = {
  // payload: { name, startDate, endDate, isCurrent? }
  create: (payload) => unwrap(api.post("/sessions", payload)),
  list: (params) => unwrap(api.get("/sessions", { params })),
  get: (id) => unwrap(api.get(`/sessions/${id}`)),
  // Setting isCurrent true clears it on every other session server-side.
  // payload: { name?, startDate?, endDate?, isCurrent? }
  update: (id, payload) => unwrap(api.patch(`/sessions/${id}`, payload)),
  // Blocked server-side for the current session or one with terms/enrollments.
  remove: (id) => unwrap(api.delete(`/sessions/${id}`)),
};

export default sessionService;
