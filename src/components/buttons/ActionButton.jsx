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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-royal-blue text-white text-sm font-medium hover:bg-royal-blue/80 transition-colors ${className}`}
    >
      {Icon ? <Icon /> : <FaPlus />}
      <span>{label}</span>
    </button>
  );
}
