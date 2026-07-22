import api from "./api";

const base = "/results";

export const resultService = {
  list: (params) => api.get(base, { params }).then((res) => res.data),
  get: (id) => api.get(`${base}/${id}`).then((res) => res.data),
  publish: (id) => api.post(`${base}/${id}/publish`).then((res) => res.data),
  reportCard: (params) =>
    api.get(`${base}/report-card`, { params }).then((res) => res.data),
};

export default resultService;
