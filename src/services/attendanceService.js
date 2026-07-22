import api, { unwrap } from "./api";

// Backend: /attendance.
// Statuses are exactly: "Present" | "Absent" | "Late" | "Excused".
export const attendanceService = {
  // payload: { teacherAssignment, date,
  //            records: [{ student, status, remark? }] }
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
};

export default attendanceService;
