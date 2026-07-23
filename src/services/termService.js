import api, { unwrap } from "./api";

// Backend: /terms. Reads are open to every signed-in role; writes are admin-only.
export const termService = {
  // payload: { session, name: "First Term"|"Second Term"|"Third Term",
  //            startDate, endDate, isCurrent? } (admin)
  create: (payload) => unwrap(api.post("/terms", payload)),
  // params: { session? } — filter by session id
  list: (params) => unwrap(api.get("/terms", { params })),
  get: (id) => unwrap(api.get(`/terms/${id}`)),
  // Session is immutable after creation. Setting isCurrent true clears the
  // other terms in the same session server-side.
  // payload: { name?, startDate?, endDate?, isCurrent? }
  update: (id, payload) => unwrap(api.patch(`/terms/${id}`, payload)),
  // Blocked server-side for the current term or one with enrollments.
  remove: (id) => unwrap(api.delete(`/terms/${id}`)),
};

export default termService;
