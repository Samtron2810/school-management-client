import api, { unwrap } from "./api";

// Backend: POST /teachers, GET /teachers (admin only).
export const teacherService = {
  // payload: { firstName, lastName, username, email, password,
  //            teacherId?, gender?, employmentDate? }
  create: (payload) => unwrap(api.post("/teachers", payload)),
  list: (params) => unwrap(api.get("/teachers", { params })),
};

export default teacherService;
