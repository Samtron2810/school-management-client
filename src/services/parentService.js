import api, { unwrap } from "./api";

// Backend: /parents. Create/list/read/update are admin-only;
// GET /parents/my/children is the signed-in parent's children roster.
// Parent↔child links live under /parent-students.
export const parentService = {
  // payload: { firstName, lastName, username, email, password,
  //            parentId?, gender?, occupation?, workplace?, address? }
  // parentId is optional — the server auto-generates one (e.g. PAR-0001).
  create: (payload) => unwrap(api.post("/parents", payload)),
  list: (params) => unwrap(api.get("/parents", { params })),
  get: (id) => unwrap(api.get(`/parents/${id}`)),
  // payload: any subset of the create fields + isActive (admin)
  update: (id, payload) => unwrap(api.patch(`/parents/${id}`, payload)),

  // Signed-in parent → [{ link, relationship, isPrimaryContact,
  //   student (populated user), schoolClass }]
  myChildren: () => unwrap(api.get("/parents/my/children")),

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
