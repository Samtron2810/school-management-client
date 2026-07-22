import api from "./api";

export const dashboardService = {
  admin: () => api.get("/dashboard/admin").then((res) => res.data),
  teacher: () => api.get("/dashboard/teacher").then((res) => res.data),
  student: () => api.get("/dashboard/student").then((res) => res.data),
  parent: () => api.get("/dashboard/parent").then((res) => res.data),
};

export default dashboardService;
