import api, { unwrap } from "./api";

// Backend: /enrollments (admin only).
export const enrollmentService = {
  // payload: { student, schoolClass }
  create: (payload) => unwrap(api.post("/enrollments", payload)),
  list: (params) => unwrap(api.get("/enrollments", { params })),
  get: (id) => unwrap(api.get(`/enrollments/${id}`)),
  // payload: { schoolClass?, status?: "Active"|"Transferred"|"Graduated"|
  //            "Withdrawn"|"Suspended", rollNumber?, enrollmentNumber? }
  update: (id, payload) => unwrap(api.patch(`/enrollments/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/enrollments/${id}`)),
};

export default enrollmentService;
