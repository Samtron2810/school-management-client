import api, { unwrap } from "./api";

// Backend: /timetables.
// Entries belong to a class + term; the class-subject, session and term are
// derived from the teacher assignment server-side.
export const timetableService = {
  // payload: { teacherAssignment, dayOfWeek: "Monday".."Sunday",
  //            startTime: "HH:MM", endTime: "HH:MM" } (admin)
  create: (payload) => unwrap(api.post("/timetables", payload)),

  // Role-scoped: teacher → own periods, student/parent → class periods,
  // admin → all current-term periods.
  my: () => unwrap(api.get("/timetables/my")),

  // admin + teacher: one class's grid (params: { session?, term? })
  forClass: (schoolClassId, params) =>
    unwrap(api.get(`/timetables/class/${schoolClassId}`, { params })),

  // payload: { dayOfWeek?, startTime?, endTime? } (admin)
  update: (id, payload) => unwrap(api.patch(`/timetables/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/timetables/${id}`)), // admin
};

export default timetableService;
