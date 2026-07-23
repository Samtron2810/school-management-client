import Badge from "./ui/Badge";

const gradeVariants = {
  A: "success",
  B: "success",
  C: "info",
  D: "warning",
  E: "warning",
  F: "danger",
};

export default function GradeBadge({ grade }) {
  const value = String(grade || "—").toUpperCase();
  return <Badge variant={gradeVariants[value] || "default"}>{value}</Badge>;
}
