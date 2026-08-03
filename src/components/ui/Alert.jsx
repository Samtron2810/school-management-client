import {
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

const alertStyles = {
  info: "bg-accent-light text-accent border-accent/20",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  error: "bg-red-50 text-danger border-red-200",
};

const alertIcons = {
  info: FaInfoCircle,
  success: FaCheckCircle,
  warning: FaExclamationTriangle,
  error: FaTimesCircle,
};

export default function Alert({ type = "info", message, onClose }) {
  const Icon = alertIcons[type];

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${alertStyles[type]}`}
    >
      <Icon className="mt-0.5 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
          title="Dismiss"
        >
          <FaTimesCircle />
        </button>
      )}
    </div>
  );
}
