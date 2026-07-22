import { FaArrowLeft } from "react-icons/fa";

export default function BackButton({ onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-sm text-slate-gray hover:text-primary transition-colors ${className}`}
    >
      <FaArrowLeft />
      <span>Back</span>
    </button>
  );
}
