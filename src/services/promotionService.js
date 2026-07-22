import api, { unwrap } from "./api";

// Backend: /promotions (admin only) — bulk student promotion between sessions.
export const promotionService = {
  list: (params) => unwrap(api.get("/promotions", { params })),
  get: (id) => unwrap(api.get(`/promotions/${id}`)),
  // payload: promotion descriptor (source/target class + students, per backend matrix)
  promote: (payload) => unwrap(api.post("/promotions", payload)),
};

export default promotionService;
