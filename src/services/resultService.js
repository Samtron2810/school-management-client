import api, { unwrap } from "./api";

// Backend: /results (+ generated report cards).
export const resultService = {
  list: (params) => unwrap(api.get("/results", { params })), // role-scoped
  get: (id) => unwrap(api.get(`/results/${id}`)),
  reportCard: (studentId) =>
    unwrap(api.get(`/results/report-card/${studentId}`)),

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
