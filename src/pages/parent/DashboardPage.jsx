import PageScaffold from "../PageScaffold";

export default function DashboardPage() {
  return (
    <PageScaffold
      title="Parent Dashboard"
      subtitle="Academic updates for your children"
      primaryAction="Message Teacher"
      stats={[
        { label: "Children", value: "2" },
        { label: "Unread Updates", value: "5" },
        { label: "Attendance Avg", value: "93%" },
        { label: "Pending Reviews", value: "3" },
      ]}
      items={[
        {
          title: "Amina Yusuf",
          description: "JSS 2 Blue academic summary",
          meta: "93% attendance",
        },
        {
          title: "Tunde Yusuf",
          description: "Primary 5 class summary",
          meta: "95% attendance",
        },
      ]}
    />
  );
}
