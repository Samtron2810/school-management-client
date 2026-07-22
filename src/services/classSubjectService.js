import api, { unwrap } from "./api";

// Backend: POST /class-subjects, GET /class-subjects (admin only).
export const classSubjectService = {
  // payload: { schoolClass, subject }
  create: (payload) => unwrap(api.post("/class-subjects", payload)),
  list: (params) => unwrap(api.get("/class-subjects", { params })),
};

export default classSubjectService;
