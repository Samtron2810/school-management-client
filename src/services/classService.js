import api, { unwrap } from "./api";

// Backend: POST /classes, GET /classes (admin only).
export const classService = {
  // payload: { className, arm, level? }
  create: (payload) => unwrap(api.post("/classes", payload)),
  list: (params) => unwrap(api.get("/classes", { params })),
};

export default classService;
