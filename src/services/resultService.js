import api, { unwrap } from "./api";

// Backend: /results (+ generated report cards). Grading bands and the
// passing score come from School Settings server-side.
export const resultService = {
  list: (params) => unwrap(api.get("/results", { params })), // role-scoped
  get: (id) => unwrap(api.get(`/results/${id}`)),
  reportCard: (studentId, params) =>
    unwrap(api.get(`/results/report-card/${studentId}`, { params })),

  // admin/teacher: every Active-enrolled student in a class at once.
  // params: { schoolClass, session?, term? }
  // → { schoolClass, session, count, reportCards: [<report card>] }
  classReportCards: (params) =>
    unwrap(api.get("/results/report-cards", { params })),

  // teacher/admin
  create: (payload) => unwrap(api.post("/results", payload)),
  fromAttempt: (attemptId, payload = {}) =>
    unwrap(api.post(`/results/attempts/${attemptId}`, payload)),
  // payload: score data → computed grade helper (admin/teacher)
  computeGrade: (payload) => unwrap(api.post("/results/compute-grade", payload)),
  update: (id, payload) => unwrap(api.patch(`/results/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/results/${id}`)),
};

export default resultService;
