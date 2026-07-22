import api from "./api";

const base = "/enrollments";

export const enrollmentService = {
  list: (params) => api.get(base, { params }).then((res) => res.data),
  create: (payload) => api.post(base, payload).then((res) => res.data),
  update: (id, payload) => api.put(`${base}/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`${base}/${id}`).then((res) => res.data),
};

export default enrollmentService;
