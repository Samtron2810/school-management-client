import api, { unwrap } from "./api";

// Backend: POST /students, GET /students (admin only).
export const studentService = {
  // payload: { firstName, lastName, username, email, password,
  //            admissionNumber?, gender: "Male"|"Female",
  //            dateOfBirth?, admissionDate? }
  create: (payload) => unwrap(api.post("/students", payload)),
  list: (params) => unwrap(api.get("/students", { params })),
};

export default studentService;
