import api from "./api";

const base = "/assessments";

export const assessmentService = {
  list: (params) => api.get(base, { params }).then((res) => res.data),
  get: (id) => api.get(`${base}/${id}`).then((res) => res.data),
  create: (payload) => api.post(base, payload).then((res) => res.data),
  update: (id, payload) => api.put(`${base}/${id}`, payload).then((res) => res.data),
  submit: (id, payload) => api.post(`${base}/${id}/submit`, payload).then((res) => res.data),
  grade: (id, payload) => api.post(`${base}/${id}/grade`, payload).then((res) => res.data),
  remove: (id) => api.delete(`${base}/${id}`).then((res) => res.data),
};

export default assessmentService;
