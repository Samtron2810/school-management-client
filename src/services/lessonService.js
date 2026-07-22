import api, { unwrap } from "./api";

// Backend: /lessons. Create/update are multipart/form-data (files[] up to 10,
// uploaded to Cloudinary); reads are JSON.
// fields: { teacherAssignment, title, topic, description?, week?, isPublished? }
function buildLessonFormData(fields = {}, files = []) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  files.forEach((file) => formData.append("files", file));
  return formData;
}

export const lessonService = {
  list: (params) => unwrap(api.get("/lessons", { params })), // admin
  myLessons: (params) => unwrap(api.get("/lessons/my", { params })), // any role (scoped)
  get: (id) => unwrap(api.get(`/lessons/${id}`)),
  create: (fields, files = []) =>
    unwrap(
      api.post("/lessons", buildLessonFormData(fields, files), {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    ),
  update: (id, fields, files = []) =>
    unwrap(
      api.patch(`/lessons/${id}`, buildLessonFormData(fields, files), {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    ),
  remove: (id) => unwrap(api.delete(`/lessons/${id}`)),
};

export default lessonService;
