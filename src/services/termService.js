import api, { unwrap } from "./api";

// Backend: POST /terms, GET /terms (admin only).
export const termService = {
  // payload: { name, startDate, endDate }
  create: (payload) => unwrap(api.post("/terms", payload)),
  list: (params) => unwrap(api.get("/terms", { params })),
};

export default termService;
