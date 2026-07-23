import api, { unwrap } from "./api";

// Backend: /teachers (admin only).
export const teacherService = {
  // payload: { firstName, lastName, username, email, password,
  //            teacherId?, gender?, employmentDate?, phoneNumber?,
  //            address?, qualification?, specialization? }
  // teacherId is optional — the server auto-generates one (e.g. TCH-0001).
  create: (payload) => unwrap(api.post("/teachers", payload)),
  list: (params) => unwrap(api.get("/teachers", { params })),
  get: (id) => unwrap(api.get(`/teachers/${id}`)),
  // payload: any subset of the create fields + isActive + isClassTeacher (admin).
  // firstName/lastName/otherName/email/username/phoneNumber sync to the user account.
  update: (id, payload) => unwrap(api.patch(`/teachers/${id}`, payload)),
};

export default teacherService;
