import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheckDouble, FaRegClock } from "react-icons/fa";
import toast from "react-hot-toast";

import useNotifications from "../../hooks/useNotifications";
import useAuth from "../../hooks/useAuth";
import { formatDateTime } from "../../utils/formatDate";

// Header bell: live unread badge + dropdown with the five most recent
// notifications. Clicking a row marks it read and follows its link.
export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // A light 5-item poll keeps the badge fresh; the full list lives on the page.
  const { items, unreadCount, markRead, markAllRead } = useNotifications({
    limit: 5,
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = user?.role?.toLowerCase() || "admin";
  const notificationsPath = `/${role}/notifications`;

  const handleItemClick = async (item) => {
    setOpen(false);
    if (!item.isRead) {
      try {
        await markRead(item._id);
      } catch {
        // non-blocking — navigation still proceeds
      }
    }
    navigate(item.link || notificationsPath);
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
    } catch {
      toast.error("Could not mark all as read");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-crimson text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-primary">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 text-xs text-royal-blue hover:underline"
              >
                <FaCheckDouble /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-gray text-center">
                You're all caught up.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                    item.isRead ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-royal-blue shrink-0" />
                    )}
                    <div className={item.isRead ? "pl-4" : ""}>
                      <p className="text-sm font-medium text-primary">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-gray line-clamp-2 mt-0.5">
                        {item.message}
                      </p>
                      <p className="text-[11px] text-slate-gray mt-1 inline-flex items-center gap-1">
                        <FaRegClock /> {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate(notificationsPath);
            }}
            className="w-full px-4 py-2.5 text-sm text-royal-blue font-medium hover:bg-gray-50 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
