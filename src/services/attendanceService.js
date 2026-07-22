import api from "./api";

const base = "/attendance";

export const attendanceService = {
  list: (params) => api.get(base, { params }).then((res) => res.data),
  mark: (payload) => api.post(base, payload).then((res) => res.data),
  update: (id, payload) => api.put(`${base}/${id}`, payload).then((res) => res.data),
  summary: (params) => api.get(`${base}/summary`, { params }).then((res) => res.data),
};

export default attendanceService;
