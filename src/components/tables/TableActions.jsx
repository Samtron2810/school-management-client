import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import IconButton from "../buttons/IconButton";

export default function TableActions({
  onView,
  onEdit,
  onDelete,
  className = "",
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {onView && <IconButton icon={FaEye} onClick={onView} label="View" />}
      {onEdit && <IconButton icon={FaEdit} onClick={onEdit} label="Edit" />}
      {onDelete && (
        <IconButton icon={FaTrashAlt} onClick={onDelete} label="Delete" />
      )}
    </div>
  );
}
