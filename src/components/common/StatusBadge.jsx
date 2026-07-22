import Badge from "../ui/Badge";

const statusMap = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "default" },
  pending: { label: "Pending", variant: "warning" },
  suspended: { label: "Suspended", variant: "danger" },
  completed: { label: "Completed", variant: "success" },
  archived: { label: "Archived", variant: "default" },
};

export default function StatusBadge({ status = "active" }) {
  const config = statusMap[status] || { label: status, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
