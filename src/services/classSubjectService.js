import api, { unwrap } from "./api";

// Backend: /class-subjects. Admin manages the links; a signed-in student
// reads their own via GET /class-subjects/my.
export const classSubjectService = {
  // payload: { schoolClass, subject, isCompulsory? } (admin)
  create: (payload) => unwrap(api.post("/class-subjects", payload)),
  // payload: { subjects: [id, ...], schoolClass, isCompulsory? } — all-or-nothing
  bulkCreate: (payload) => unwrap(api.post("/class-subjects/bulk", payload)),
  list: (params) => unwrap(api.get("/class-subjects", { params })), // admin
  get: (id) => unwrap(api.get(`/class-subjects/${id}`)), // admin
  // payload: { schoolClass?, subject?, isCompulsory?, isActive? } (admin)
  update: (id, payload) => unwrap(api.patch(`/class-subjects/${id}`, payload)),
  // Blocked server-side while lessons/assessments reference the link.
  remove: (id) => unwrap(api.delete(`/class-subjects/${id}`)),

  // Signed-in student → the class-subjects for their current class.
  my: () => unwrap(api.get("/class-subjects/my")),
};

export default classSubjectService;
