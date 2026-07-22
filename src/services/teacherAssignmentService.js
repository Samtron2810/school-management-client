import api, { unwrap } from "./api";

// Backend: POST /teacher-assignments, GET /teacher-assignments (admin only).
// The returned assignment id is the join key for lessons, attendance,
// assessments and questions.
export const teacherAssignmentService = {
  // payload: { teacher, schoolClass, subject }
  create: (payload) => unwrap(api.post("/teacher-assignments", payload)),
  list: (params) => unwrap(api.get("/teacher-assignments", { params })),
};

export default teacherAssignmentService;
