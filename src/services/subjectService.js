import api, { unwrap } from "./api";

// Backend: /subjects (admin only; GET is admin-only too).
export const subjectService = {
  // payload: { name, code }
  create: (payload) => unwrap(api.post("/subjects", payload)),
  list: (params) => unwrap(api.get("/subjects", { params })),
  get: (id) => unwrap(api.get(`/subjects/${id}`)),
  update: (id, payload) => unwrap(api.patch(`/subjects/${id}`, payload)),
  // Blocked server-side while class-subjects/teacher-assignments reference it.
  remove: (id) => unwrap(api.delete(`/subjects/${id}`)),
};

export default subjectService;
