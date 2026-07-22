import api, { unwrap } from "./api";

// Backend: POST /parents, GET /parents, GET /parents/:id (admin only).
// Parent↔child links live under /parent-students.
export const parentService = {
  // payload: { firstName, lastName, username, email, password,
  //            parentId?, gender?, occupation?, workplace?, address? }
  create: (payload) => unwrap(api.post("/parents", payload)),
  list: (params) => unwrap(api.get("/parents", { params })),
  get: (id) => unwrap(api.get(`/parents/${id}`)),

  // --- Parent ↔ student linking (admin) ---
  // payload: { parent, student, relationship? }
  linkStudent: (payload) => unwrap(api.post("/parent-students", payload)),
  getChildren: (parentId) =>
    unwrap(api.get(`/parent-students/parent/${parentId}`)),
  getParentsOfStudent: (studentId) =>
    unwrap(api.get(`/parent-students/student/${studentId}`)),
  removeLink: (linkId) =>
    unwrap(api.patch(`/parent-students/${linkId}/remove`)),
};

export default parentService;
