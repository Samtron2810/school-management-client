import PageScaffold from "../PageScaffold";

export default function AttendancePage() {
  return (
    <PageScaffold
      title="Attendance"
      subtitle="Your attendance record for the term"
      primaryAction="View Details"
      stats={[
        { label: "Present", value: "94%" },
        { label: "Absent", value: "4" },
        { label: "Late", value: "2" },
        { label: "Streak", value: "12 days" },
      ]}
      items={[
        {
          title: "This Week",
          description: "All marked school days",
          meta: "100%",
        },
        {
          title: "Current Term",
          description: "Attendance summary",
          meta: "94%",
        },
      ]}
    />
  );
}
