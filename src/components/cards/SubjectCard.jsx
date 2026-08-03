import { FaBook, FaClock, FaUser } from "react-icons/fa";
import Badge from "../ui/Badge";

export default function SubjectCard({ subject, onSelect }) {
  return (
    <div
      onClick={() => onSelect?.(subject)}
      className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 rounded-lg bg-accent-light text-accent">
          <FaBook className="text-xl" />
        </div>
        <Badge variant={subject.status === "active" ? "success" : "warning"}>
          {subject.status || "Active"}
        </Badge>
      </div>
      <h3 className="text-base font-semibold text-primary">{subject.name}</h3>
      <p className="text-sm text-slate-gray mt-1">{subject.code}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-gray">
        <span className="flex items-center gap-1">
          <FaUser />
          {subject.teacher || "Unassigned"}
        </span>
        <span className="flex items-center gap-1">
          <FaClock />
          {subject.credits || 0} Credits
        </span>
      </div>
    </div>
  );
}
