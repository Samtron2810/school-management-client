import Badge from "../ui/Badge";

const statusMap = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "default" },
  pending: { label: "Pending", variant: "warning" },
  suspended: { label: "Suspended", variant: "danger" },
  completed: { label: "Completed", variant: "success" },
  archived: { label: "Archived", variant: "default" },
  // Backend attendance enums
  present: { label: "Present", variant: "success" },
  absent: { label: "Absent", variant: "danger" },
  late: { label: "Late", variant: "warning" },
  excused: { label: "Excused", variant: "info" },
  // Common lifecycle states
  published: { label: "Published", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
  submitted: { label: "Submitted", variant: "success" },
  "in-progress": { label: "In Progress", variant: "info" },
  graded: { label: "Graded", variant: "success" },
};

export default function StatusBadge({ status = "active" }) {
  const key = String(status).toLowerCase();
  const config = statusMap[key] || { label: status, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
