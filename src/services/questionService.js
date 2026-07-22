import api, { unwrap } from "./api";

// Backend: /questions (Question Bank, teacher/admin).
// create payload: { question, teacherAssignment, options: [], correctAnswer,
//                   marks?, difficulty?, explanation?, isPublished? }
// list query params: page, limit, search, classSubject, session, term,
//                    difficulty, teacher, sortBy, sortOrder
export const questionService = {
  list: (params) => unwrap(api.get("/questions", { params })),
  get: (id) => unwrap(api.get(`/questions/${id}`)),
  create: (payload) => unwrap(api.post("/questions", payload)),
  update: (id, payload) => unwrap(api.patch(`/questions/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/questions/${id}`)),
  // payload: { questionIds: [] } — bulk delete
  bulkRemove: (payload) => unwrap(api.delete("/questions", { data: payload })),
  duplicate: (id) => unwrap(api.post(`/questions/${id}/duplicate`)),
};

export default questionService;
