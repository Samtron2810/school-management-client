import PageScaffold from "../PageScaffold";

export default function ReportCardPage() {
  return (
    <PageScaffold
      title="Report Cards"
      subtitle="Prepare comments and review grades"
      primaryAction="Review Reports"
      stats={[
        { label: "Assigned", value: "180" },
        { label: "Completed", value: "132" },
        { label: "Pending", value: "48" },
        { label: "Published", value: "0" },
      ]}
      items={[
        {
          title: "JSS 1 Term Report",
          description: "Class teacher comments pending",
          meta: "35 students",
        },
        {
          title: "SSS 1 Science Report",
          description: "Subject remarks ready",
          meta: "28 students",
        },
      ]}
    />
  );
}
