import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBullhorn,
  FaCheckDouble,
  FaFileAlt,
  FaClipboardList,
  FaBook,
  FaBell,
  FaRegClock,
  FaTrashAlt,
} from "react-icons/fa";

import useNotifications from "../../hooks/useNotifications";
import { formatDateTime } from "../../utils/formatDate";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/ui/Button";

const typeIcons = {
  announcement: FaBullhorn,
  result: FaFileAlt,
  assessment: FaClipboardList,
  lesson: FaBook,
  general: FaBell,
};

// Shared inbox for every role: announcements, published results, assessment
// and lesson notifications land here (emitted server-side).
export default function NotificationsPage() {
  const navigate = useNavigate();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const {
    items,
    unreadCount,
    loading,
    error,
    refetch,
    markRead,
    markAllRead,
    remove,
  } = useNotifications({ limit: 50, unread: unreadOnly, pollInterval: 60000 });

  const handleOpen = async (item) => {
    if (!item.isRead) {
      try {
        await markRead(item._id);
      } catch {
        // non-blocking
      }
    }
    if (item.link) navigate(item.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Could not mark all as read");
    }
  };

  if (loading) return <Loader text="Loading notifications..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "You're all caught up"
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              icon={FaCheckDouble}
              onClick={handleMarkAll}
            >
              Mark all read
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex gap-2">
        {[
          { key: false, label: "All" },
          { key: true, label: "Unread" },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setUnreadOnly(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              unreadOnly === tab.key
                ? "bg-coral text-white"
                : "bg-white text-slate-gray border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={
            unreadOnly ? "No unread notifications" : "No notifications yet"
          }
          description="Announcements, new results, and assessment updates will appear here."
        />
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 divide-y divide-gray-50">
          {items.map((item) => {
            const Icon = typeIcons[item.type] || FaBell;
            return (
              <div
                key={item._id}
                className="group relative flex items-start gap-3 px-4 sm:px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => handleOpen(item)}
                  className={`flex items-start gap-3 flex-1 min-w-0 text-left ${
                    item.isRead ? "opacity-70" : ""
                  }`}
                >
                  <span
                    className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                      item.isRead
                        ? "bg-gray-100 text-slate-gray"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary truncate">
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      )}
                    </span>
                    <span className="block text-sm text-slate-gray mt-0.5">
                      {item.message}
                    </span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-gray">
                      <FaRegClock /> {formatDateTime(item.createdAt)}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await remove(item._id);
                      toast.success("Notification deleted");
                    } catch {
                      toast.error("Could not delete notification");
                    }
                  }}
                  className="p-2 rounded-lg text-slate-gray hover:text-danger hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0 self-center"
                  aria-label="Delete notification"
                >
                  <FaTrashAlt />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
