import { FaPlus } from "react-icons/fa";

export default function ActionButton({
  label,
  onClick,
  icon: Icon,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-coral text-white text-sm font-medium hover:bg-coral/80 transition-colors ${className}`}
    >
      {Icon ? <Icon /> : <FaPlus />}
      <span>{label}</span>
    </button>
  );
}
