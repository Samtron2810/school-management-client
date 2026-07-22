import PageScaffold from "../PageScaffold";

export default function AttendancePage() {
  return (
    <PageScaffold
      title="Attendance"
      subtitle="Record and review student attendance"
      primaryAction="Mark Attendance"
      stats={[
        { label: "Today Present", value: "162" },
        { label: "Absent", value: "18" },
        { label: "Classes Taken", value: "4" },
        { label: "Unmarked", value: "2" },
      ]}
      items={[
        {
          title: "JSS 1 Mathematics",
          description: "Morning period attendance",
          meta: "Marked",
        },
        {
          title: "JSS 2 English",
          description: "Afternoon period attendance",
          meta: "Pending",
        },
      ]}
    />
  );
}
