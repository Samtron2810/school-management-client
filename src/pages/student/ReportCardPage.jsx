import PageScaffold from "../PageScaffold";

export default function ReportCardPage() {
  return (
    <PageScaffold
      title="Report Card"
      subtitle="Term report and teacher comments"
      primaryAction="Download"
      stats={[
        { label: "Average", value: "76%" },
        { label: "Position", value: "8th" },
        { label: "Conduct", value: "A" },
        { label: "Status", value: "Draft" },
      ]}
      items={[
        {
          title: "First Term Report",
          description: "Academic performance summary",
          meta: "Available",
        },
        {
          title: "Teacher Comment",
          description: "Class teacher remarks",
          meta: "Pending",
        },
      ]}
    />
  );
}
