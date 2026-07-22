import PageScaffold from "../PageScaffold";

export default function ViewResultsPage() {
  return (
    <PageScaffold
      title="Results"
      subtitle="View performance across your classes"
      primaryAction="Export Results"
      stats={[
        { label: "Assessments", value: "14" },
        { label: "Average", value: "72%" },
        { label: "Improved", value: "46" },
        { label: "Needs Support", value: "12" },
      ]}
      items={[
        {
          title: "JSS 1 Mathematics",
          description: "Continuous assessment results",
          meta: "78% avg",
        },
        {
          title: "SSS 1 Physics",
          description: "Midterm assessment results",
          meta: "69% avg",
        },
      ]}
    />
  );
}
