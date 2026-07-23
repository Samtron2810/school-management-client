import api, { unwrap } from "./api";

// Backend: /teacher-assignments. The assignment id is the join key for
// lessons, attendance, assessments, questions and timetable entries.
export const teacherAssignmentService = {
  // payload: { teacher, schoolClass, subject } (admin)
  create: (payload) => unwrap(api.post("/teacher-assignments", payload)),
  list: (params) => unwrap(api.get("/teacher-assignments", { params })), // admin
  get: (id) => unwrap(api.get(`/teacher-assignments/${id}`)), // admin
  // payload: { teacher?, subject?, schoolClass?, isActive? } (admin)
  update: (id, payload) =>
    unwrap(api.patch(`/teacher-assignments/${id}`, payload)),
  // Blocked server-side while assessments/attendance reference it.
  remove: (id) => unwrap(api.delete(`/teacher-assignments/${id}`)), // admin

  // Signed-in teacher → own assignments (subject + class + session/term populated).
  my: (params) => unwrap(api.get("/teacher-assignments/my", { params })),

  // Roster for one assignment — admin, or the teacher who owns it.
  // → [{ student (populated user), rollNumber, ... }] (Active enrollments)
  students: (id) => unwrap(api.get(`/teacher-assignments/${id}/students`)),
};

export default teacherAssignmentService;
