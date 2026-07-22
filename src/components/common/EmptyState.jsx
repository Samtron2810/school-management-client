import { FaInbox } from "react-icons/fa";
import Button from "../ui/Button";

export default function EmptyState({
  icon: Icon,
  title = "No data found",
  description = "There are no items to display at this moment.",
  actionLabel,
  onAction,
}) {
  const DisplayIcon = Icon || FaInbox;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 rounded-full bg-light-blue text-royal-blue mb-4">
        <DisplayIcon className="text-4xl" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <p className="text-sm text-slate-gray max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
