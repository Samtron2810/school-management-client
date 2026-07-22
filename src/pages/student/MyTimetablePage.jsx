import PageScaffold from "../PageScaffold";

export default function MyTimetablePage() {
  return (
    <PageScaffold
      title="My Timetable"
      subtitle="Your weekly class schedule"
      primaryAction="Print"
      stats={[
        { label: "Periods Today", value: "5" },
        { label: "This Week", value: "28" },
        { label: "Free Periods", value: "3" },
        { label: "Activities", value: "2" },
      ]}
      items={[
        {
          title: "Mathematics",
          description: "Monday, Wednesday, Friday",
          meta: "9:00 AM",
        },
        {
          title: "English Language",
          description: "Tuesday and Thursday",
          meta: "11:00 AM",
        },
      ]}
    />
  );
}
