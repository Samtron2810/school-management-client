import { FaUserPlus, FaSchool, FaBullhorn, FaFileAlt } from "react-icons/fa";

const actions = [
  { label: "Add New Student", icon: FaUserPlus },
  { label: "Create Class", icon: FaSchool },
  { label: "Post Announcement", icon: FaBullhorn },
  { label: "Generate Report", icon: FaFileAlt },
];

export default function QuickActions({ onAction }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction?.(action.label)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-royal-blue text-white text-sm font-medium hover:bg-royal-blue/80 transition-colors"
          >
            <action.icon />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
