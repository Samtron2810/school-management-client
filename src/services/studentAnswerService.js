import api, { unwrap } from "./api";

// Backend: /student-answers (student autosaves during an attempt).
export const studentAnswerService = {
  // payload: { attempt, question, selectedAnswer }
  save: (payload) => unwrap(api.post("/student-answers", payload)),
  forAttempt: (attemptId) =>
    unwrap(api.get(`/student-answers/attempts/${attemptId}`)),
  review: (attemptId) =>
    unwrap(api.get(`/student-answers/attempts/${attemptId}/review`)),
  getOne: (attemptId, questionId) =>
    unwrap(
      api.get(`/student-answers/attempts/${attemptId}/questions/${questionId}`),
    ),
  clear: (attemptId, questionId) =>
    unwrap(
      api.delete(
        `/student-answers/attempts/${attemptId}/questions/${questionId}`,
      ),
    ),
};

export default studentAnswerService;
