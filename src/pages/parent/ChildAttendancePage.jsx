import PageScaffold from "../PageScaffold";

export default function ChildAttendancePage() {
  return (
    <PageScaffold
      title="Child Attendance"
      subtitle="Attendance records for linked children"
      primaryAction="Download"
      stats={[
        { label: "Average", value: "93%" },
        { label: "Absences", value: "6" },
        { label: "Late Marks", value: "3" },
        { label: "This Week", value: "100%" },
      ]}
      items={[
        {
          title: "Amina Yusuf",
          description: "Current term attendance",
          meta: "93%",
        },
        {
          title: "Tunde Yusuf",
          description: "Current term attendance",
          meta: "95%",
        },
      ]}
    />
  );
}
