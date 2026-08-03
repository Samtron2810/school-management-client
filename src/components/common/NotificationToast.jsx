import { useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-700",
  error: "bg-red-50 border-red-200 text-danger",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  info: "bg-accent-light border-accent/20 text-accent",
};

const toastIcons = {
  success: FaCheckCircle,
  error: FaTimesCircle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
};

export default function NotificationToast({
  type = "info",
  message,
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const Icon = toastIcons[type];

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg ${toastStyles[type]}`}
    >
      <Icon className="mt-0.5 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={onClose}
        className="shrink-0 hover:opacity-70 transition-opacity"
      >
        <FaTimesCircle />
      </button>
    </div>
  );
}
