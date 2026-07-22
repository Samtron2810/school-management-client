import api from "./api";

const base = "/parents";

export const parentService = {
  list: (params) => api.get(base, { params }).then((res) => res.data),
  get: (id) => api.get(`${base}/${id}`).then((res) => res.data),
  getChildren: (id) => api.get(`${base}/${id}/children`).then((res) => res.data),
  messageTeacher: (payload) =>
    api.post(`${base}/message-teacher`, payload).then((res) => res.data),
};

export default parentService;
