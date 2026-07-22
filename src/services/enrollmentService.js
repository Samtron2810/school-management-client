import api, { unwrap } from "./api";

// Backend: POST /enrollments, GET /enrollments (admin only).
export const enrollmentService = {
  // payload: { student, schoolClass }
  create: (payload) => unwrap(api.post("/enrollments", payload)),
  list: (params) => unwrap(api.get("/enrollments", { params })),
};

export default enrollmentService;
