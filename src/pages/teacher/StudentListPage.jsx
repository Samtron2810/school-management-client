import PageScaffold from "../PageScaffold";

export default function StudentListPage() {
  return (
    <PageScaffold
      title="Students"
      subtitle="Students in your assigned classes"
      primaryAction="Export List"
      stats={[
        { label: "Total Students", value: "180" },
        { label: "Class Groups", value: "6" },
        { label: "At Risk", value: "9" },
        { label: "Top Performers", value: "24" },
      ]}
      items={[
        {
          title: "JSS 1",
          description: "Mathematics class list",
          meta: "35 students",
        },
        {
          title: "SSS 1",
          description: "Physics class list",
          meta: "28 students",
        },
      ]}
    />
  );
}
