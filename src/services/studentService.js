import api, { unwrap } from "./api";

// Backend: /students (admin only).
export const studentService = {
  // payload: { firstName, lastName, username, email, password,
  //            admissionNumber?, gender: "Male"|"Female",
  //            dateOfBirth?, admissionDate?, ... }
  // admissionNumber is optional — the server auto-generates one (e.g. STU-0001).
  create: (payload) => unwrap(api.post("/students", payload)),
  list: (params) => unwrap(api.get("/students", { params })),
  get: (id) => unwrap(api.get(`/students/${id}`)),
  // payload: any subset of the create fields + isActive (admin).
  update: (id, payload) => unwrap(api.patch(`/students/${id}`, payload)),
};

export default studentService;
