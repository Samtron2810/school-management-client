import api, { unwrap } from "./api";

// Backend: POST /subjects, GET /subjects (admin only).
export const subjectService = {
  // payload: { name, code }
  create: (payload) => unwrap(api.post("/subjects", payload)),
  list: (params) => unwrap(api.get("/subjects", { params })),
};

export default subjectService;
