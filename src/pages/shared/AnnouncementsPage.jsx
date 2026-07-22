import PageScaffold from "../PageScaffold";

export default function AnnouncementsPage() {
  return (
    <PageScaffold
      title="Announcements"
      subtitle="School notices and updates"
      primaryAction="Refresh"
      stats={[
        { label: "Unread", value: "3" },
        { label: "This Week", value: "6" },
        { label: "Pinned", value: "2" },
        { label: "Archived", value: "14" },
      ]}
      items={[
        {
          title: "School Reopening",
          description: "Updated resumption details",
          meta: "Pinned",
        },
        {
          title: "Exam Schedule",
          description: "Midterm assessment timetable",
          meta: "New",
        },
      ]}
    />
  );
}
