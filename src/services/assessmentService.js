import api, { unwrap } from "./api";

// Backend: /assessments (teacher/admin manage; students take via
// studentAttemptService + studentAnswerService).
// create payload: { title, teacherAssignment, availableFrom, availableTo,
//   type: "Quiz"|"Test"|"Assignment"|"Examination", duration?, instructions?,
//   maxAttempts?, passingScore?, shuffleQuestions?, shuffleOptions?,
//   showScoreImmediately?, showCorrectAnswers?,
//   questions?: [{ question, marks, order, isBonus?, isRequired? }] }
export const assessmentService = {
  list: (params) => unwrap(api.get("/assessments", { params })),
  available: (params) => unwrap(api.get("/assessments/available", { params })), // student
  get: (id) => unwrap(api.get(`/assessments/${id}`)),
  create: (payload) => unwrap(api.post("/assessments", payload)),
  update: (id, payload) => unwrap(api.patch(`/assessments/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/assessments/${id}`)), // admin only

  publish: (id) => unwrap(api.patch(`/assessments/${id}/publish`)),
  unpublish: (id) => unwrap(api.patch(`/assessments/${id}/unpublish`)),

  // payload: { questions: [{ question, order, marks?, isBonus?, isRequired? }] }
  // NOTE: unlike removeQuestions, this endpoint does NOT accept { questionIds }.
  addQuestions: (id, payload) =>
    unwrap(api.post(`/assessments/${id}/questions`, payload)),
  // payload: { questionIds: [] } — axios needs `data` for DELETE bodies
  removeQuestions: (id, payload) =>
    unwrap(api.delete(`/assessments/${id}/questions`, { data: payload })),
};

export default assessmentService;
