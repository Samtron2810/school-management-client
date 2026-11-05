import api, { unwrap } from "./api";

// Backend: /promotions (admin only) — bulk student promotion between sessions.
export const promotionService = {
  list: (params) => unwrap(api.get("/promotions", { params })),
  // Students a run would act on -> { session, students: [{ student, rollNumber }] }
  // params: { fromClass, session? }
  roster: (params) => unwrap(api.get("/promotions/roster", { params })),
  get: (id) => unwrap(api.get(`/promotions/${id}`)),
  // payload: { fromClass, toClass, targetSession, targetTerm,
  //   graduate?: bool (final class, no toClass), repeatStudentIds?: [id] }
  promote: (payload) => unwrap(api.post("/promotions", payload)),
};

export default promotionService;
