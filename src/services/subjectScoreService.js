import api, { unwrap } from "./api";

// Backend: /subject-scores. The mark-entry grid for a class+subject+term.
export const subjectScoreService = {
  // params: { schoolClass, subject, session?, term? }
  // -> { classSubject, session, term, scoreComponents, students: [
  //      { student, rollNumber, subjectScoreId, scores, total,
  //        totalMaxMarks, percentage, grade, isPublished } ] }
  grid: (params) => unwrap(api.get("/subject-scores", { params })),

  // payload: { classSubject, session?, term?,
  //   entries: [{ student, scores: { quiz: 8, test: 15, ... } }] }
  // Partial fill allowed. Per-row failures don't block the rest of the
  // batch -- response includes { saved, failed, savedCount, failedCount }.
  bulkSave: (payload) => unwrap(api.put("/subject-scores/bulk", payload)),
};

export default subjectScoreService;
