import api, { unwrap } from "./api";

// The backend serves ONE role-aware endpoint: GET /dashboard.
// The payload is assembled server-side from req.user.role.
export const dashboardService = {
  getDashboard: () => unwrap(api.get("/dashboard")),
  // Convenience aliases — all hit the same role-scoped endpoint.
  admin: () => unwrap(api.get("/dashboard")),
  teacher: () => unwrap(api.get("/dashboard")),
  student: () => unwrap(api.get("/dashboard")),
  parent: () => unwrap(api.get("/dashboard")),
};

export default dashboardService;
