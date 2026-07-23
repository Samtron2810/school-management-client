import api, { unwrap } from "./api";

// Backend: /notifications (any signed-in user, own only).
// GET /notifications/my → { items: [], unreadCount, pagination }.
export const notificationService = {
  // params: { page?, limit?, unread?: "true" }
  my: (params) => unwrap(api.get("/notifications/my", { params })),
  markRead: (id) => unwrap(api.patch(`/notifications/${id}/read`)),
  markAllRead: () => unwrap(api.patch("/notifications/read-all")),
};

export default notificationService;
