import api, { unwrap } from "./api";

// Backend: /report-cards. Built from SubjectScore (the mark-entry data),
// separate from the older per-attempt /results endpoints.
export const reportCardService = {
  // admin/teacher -- students in a class with any score data (complete or
  // not), plus the class-level publish state.
  // params: { schoolClass, session?, term? }
  list: (params) => unwrap(api.get("/report-cards", { params })),

  // Full report card detail. Staff can view any time; a student/parent
  // only once published (404 otherwise).
  // params: { session?, term? }
  // config: optional axios config overrides, e.g. { skipErrorToast: true }
  // (used by student/parent pages so a 404-before-publish doesn't toast).
  get: (studentId, params, config = {}) =>
    unwrap(api.get(`/report-cards/${studentId}`, { params, ...config })),

  // Class-level publish/unpublish. Publishing sets isPublished on every
  // SubjectScore row for actively-enrolled students in the class.
  // payload: { session?, term? }
  publishClass: (schoolClassId, payload = {}) =>
    unwrap(api.post(`/report-cards/${schoolClassId}/publish`, payload)),
  unpublishClass: (schoolClassId, payload = {}) =>
    unwrap(api.post(`/report-cards/${schoolClassId}/unpublish`, payload)),

  // Per-student override. payload: { isPublished, session?, term? }
  setStudentPublishState: (studentId, payload) =>
    unwrap(api.patch(`/report-cards/${studentId}/publish`, payload)),

  // Single-student PDF download. Auth here is a Bearer token (not
  // cookies), so a plain <a href> would be unauthenticated -- this fetches
  // through the authenticated axios instance as a blob instead. Returns a
  // raw axios response; caller triggers the browser download (see
  // utils/downloadBlob.js).
  // params: { session?, term? }
  download: (studentId, params = {}) =>
    api.get(`/report-cards/${studentId}/download`, {
      params,
      responseType: "blob",
    }),

  // payload: { students: [id, ...], session?, term? }
  // Returns a raw axios response with blob data -- caller handles the
  // download (see utils/downloadBlob.js).
  bulkDownload: (payload) =>
    api.post("/report-cards/bulk-download", payload, { responseType: "blob" }),
};

export default reportCardService;
