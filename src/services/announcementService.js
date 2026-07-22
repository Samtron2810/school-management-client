import api, { unwrap } from "./api";

// Backend: /announcements. Reads: any authenticated user.
// Writes: admin/teacher (update/delete additionally require ownership).
export const announcementService = {
  list: (params) => unwrap(api.get("/announcements", { params })),
  get: (id) => unwrap(api.get(`/announcements/${id}`)),
  create: (payload) => unwrap(api.post("/announcements", payload)),
  update: (id, payload) => unwrap(api.patch(`/announcements/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/announcements/${id}`)),
};

export default announcementService;
