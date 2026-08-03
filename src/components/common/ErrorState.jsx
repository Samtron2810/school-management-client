import { FaExclamationTriangle } from "react-icons/fa";
import Button from "../ui/Button";

// Inline error panel for API-backed pages (axios already pops a toast).
export default function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-full bg-red-50 text-danger mb-4">
        <FaExclamationTriangle className="text-3xl" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-gray max-w-sm mb-6">{description}</p>
      )}
      {onRetry && <Button onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
