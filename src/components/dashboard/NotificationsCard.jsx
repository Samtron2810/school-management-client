import { useState } from "react";
import { FaExclamationTriangle, FaTrashAlt, FaTimes } from "react-icons/fa";
import Modal from "../ui/Modal";

const initialNotifications = [
  {
    id: 1,
    text: "Facility Maintenance - Water system repair scheduled",
    type: "alert",
  },
  {
    id: 2,
    text: "Staff meeting rescheduled to Friday 3 PM",
    type: "info",
  },
  {
    id: 3,
    text: "Exam timetable published for final term",
    type: "info",
  },
];

export default function NotificationsCard() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setNotifications((prev) => prev.filter((n) => n.id !== selectedId));
    setDeleteModalOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Important Notifications
        </h3>
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="flex items-start justify-between gap-3 p-3 rounded-lg bg-light-blue"
            >
              <div className="flex items-start gap-3">
                {notification.type === "alert" ? (
                  <FaExclamationTriangle className="text-crimson mt-0.5" />
                ) : (
                  <FaExclamationTriangle className="text-royal-blue mt-0.5" />
                )}
                <p className="text-sm text-slate-gray">{notification.text}</p>
              </div>
              <button
                onClick={() => handleDeleteClick(notification.id)}
                className="text-crimson hover:text-crimson/70 transition-colors shrink-0"
              >
                <FaTrashAlt />
              </button>
            </li>
          ))}
        </ul>
        {notifications.length === 0 && (
          <p className="text-sm text-slate-gray text-center py-4">
            No notifications
          </p>
        )}
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <p className="text-sm text-slate-gray mb-6">
          Are you sure you want to delete this notification?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="px-4 py-2 rounded-lg text-sm text-slate-gray hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 rounded-lg text-sm bg-crimson text-white hover:bg-crimson/80 transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
