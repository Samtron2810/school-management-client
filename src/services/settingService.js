import api, { unwrap } from "./api";

// Backend: GET /settings (any role), PATCH /settings (admin).
// The settings doc is a singleton, auto-created with defaults server-side:
//   { schoolName, logo: { url }, address, email, phoneNumber,
//     gradeBands: [{ grade, minScore, gradePoint, remark }],
//     passingScore, idFormats: { teacher|student|parent: { prefix, padding } } }
export const settingService = {
  get: () => unwrap(api.get("/settings")),
  // payload: { schoolName?, address?, email?, phoneNumber?, logoUrl?,
  //            passingScore?, gradeBands?, idFormats? }
  update: (payload) => unwrap(api.patch("/settings", payload)),
};

export default settingService;
