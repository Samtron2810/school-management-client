import api, { unwrap } from "./api";

// Backend: /student-attempts (student CBT engine; auto-submit is admin/cron).
export const studentAttemptService = {
  // payload: { assessment } — starts a new attempt for the signed-in student
  start: (payload) => unwrap(api.post("/student-attempts", payload)),
  list: (params) => unwrap(api.get("/student-attempts", { params })),
  get: (id) => unwrap(api.get(`/student-attempts/${id}`)),
  questions: (id) => unwrap(api.get(`/student-attempts/${id}/questions`)),
  submit: (id, payload = {}) =>
    unwrap(api.patch(`/student-attempts/${id}/submit`, payload)),
  autoSubmit: (id, payload = {}) =>
    unwrap(api.patch(`/student-attempts/${id}/auto-submit`, payload)), // admin
};

export default studentAttemptService;
