import api, { unwrap } from "./api";

// Backend: POST /sessions, GET /sessions (admin only).
export const sessionService = {
  // payload: { name, startDate, endDate }
  create: (payload) => unwrap(api.post("/sessions", payload)),
  list: (params) => unwrap(api.get("/sessions", { params })),
};

export default sessionService;
