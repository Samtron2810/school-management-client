import PageScaffold from "../PageScaffold";

export default function DashboardPage() {
  return (
    <PageScaffold
      title="Student Dashboard"
      subtitle="Your classes, lessons, and assessment activity"
      primaryAction="View Timetable"
      stats={[
        { label: "Subjects", value: "8" },
        { label: "Classes Today", value: "5" },
        { label: "Assignments", value: "3" },
        { label: "Attendance", value: "94%" },
      ]}
      items={[
        {
          title: "Mathematics",
          description: "Algebra revision and class exercise",
          meta: "9:00 AM",
        },
        {
          title: "English Language",
          description: "Essay writing practice",
          meta: "11:00 AM",
        },
      ]}
    />
  );
}
