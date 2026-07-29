import { useCallback, useEffect, useRef, useState } from "react";
import notificationService from "../services/notificationService";

// Shared notifications hook for the header bell and the Notifications page.
// Polls the unread feed on an interval so the badge stays fresh without a
// page reload. The backend returns { items, unreadCount, pagination }.
export default function useNotifications({
  limit = 20,
  unread = false,
  pollInterval = 60000,
} = {}) {
  const [data, setData] = useState({
    items: [],
    unreadCount: 0,
    pagination: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetchNow = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const payload = await notificationService.my({
          limit,
          ...(unread ? { unread: "true" } : {}),
        });
        if (mounted.current) {
          setData({
            items: payload?.items || [],
            unreadCount: payload?.unreadCount ?? 0,
            pagination: payload?.pagination || null,
          });
          setError(null);
        }
      } catch (err) {
        if (mounted.current) setError(err);
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [limit, unread],
  );

  useEffect(() => {
    mounted.current = true;
    // Scheduled so state updates land outside the effect body.
    const kickoff = setTimeout(() => fetchNow(true), 0);
    let interval = null;
    if (pollInterval > 0) {
      interval = setInterval(() => fetchNow(false), pollInterval);
    }
    return () => {
      mounted.current = false;
      clearTimeout(kickoff);
      if (interval) clearInterval(interval);
    };
  }, [fetchNow, pollInterval]);

  const markRead = useCallback(async (id) => {
    await notificationService.markRead(id);
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === id ? { ...item, isRead: true } : item,
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({ ...item, isRead: true })),
      unreadCount: 0,
    }));
  }, []);

  const remove = useCallback(async (id) => {
    await notificationService.remove(id);
    setData((prev) => {
      const item = prev.items.find((i) => i._id === id);
      return {
        ...prev,
        items: prev.items.filter((i) => i._id !== id),
        unreadCount:
          item && !item.isRead ? prev.unreadCount - 1 : prev.unreadCount,
      };
    });
  }, []);

  return {
    items: data.items,
    unreadCount: data.unreadCount,
    pagination: data.pagination,
    loading,
    error,
    refetch: () => fetchNow(true),
    markRead,
    markAllRead,
    remove,
  };
}
