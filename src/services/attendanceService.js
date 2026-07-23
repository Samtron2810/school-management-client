import api, { unwrap } from "./api";

// Backend: /attendance.
// Statuses are exactly: "Present" | "Absent" | "Late" | "Excused".
export const attendanceService = {
  // payload: { teacherAssignment, date,
  //            records: [{ student, status, remark? }] } (admin + teacher)
  mark: (payload) => unwrap(api.post("/attendance", payload)),
  update: (id, payload) => unwrap(api.patch(`/attendance/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/attendance/${id}`)), // admin only

  // Queries
  byDate: (teacherAssignmentId, params) =>
    unwrap(api.get(`/attendance/date/${teacherAssignmentId}`, { params })),
  forStudent: (studentId, params) =>
    unwrap(api.get(`/attendance/student/${studentId}`, { params })),
  summaryForStudent: (studentId, params) =>
    unwrap(api.get(`/attendance/summary/${studentId}`, { params })),

  // Whole-class views (admin + teacher):
  // Daily register → [{ student (populated user), status, remark, ... }]
  register: (params) => unwrap(api.get("/attendance/register", { params })),
  // Range summary → per-student totals + attendancePercentage
  // params: { schoolClass, from, to }
  classSummary: (params) => unwrap(api.get("/attendance/summary", { params })),
};

export default attendanceService;
