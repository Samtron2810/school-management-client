import PageScaffold from "../PageScaffold";

export default function MyClassesPage() {
  return (
    <PageScaffold
      title="My Classes"
      subtitle="Your current class placement and timetable"
      primaryAction="View Timetable"
      stats={[
        { label: "Class", value: "JSS 2" },
        { label: "Classmates", value: "32" },
        { label: "Teachers", value: "9" },
        { label: "Periods Today", value: "5" },
      ]}
      items={[
        {
          title: "JSS 2 Blue",
          description: "Current academic class",
          meta: "Active",
        },
        {
          title: "Science Club",
          description: "Weekly enrichment class",
          meta: "Friday",
        },
      ]}
    />
  );
}
