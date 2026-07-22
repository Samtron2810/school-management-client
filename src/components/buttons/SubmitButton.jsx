import { FaSpinner } from "react-icons/fa";

export default function SubmitButton({
  label = "Submit",
  loading = false,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-royal-blue text-white text-sm font-medium hover:bg-royal-blue/80 transition-colors ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {loading && <FaSpinner className="animate-spin" />}
      <span>{loading ? "Processing..." : label}</span>
    </button>
  );
}
