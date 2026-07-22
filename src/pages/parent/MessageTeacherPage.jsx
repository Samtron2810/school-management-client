import PageScaffold from "../PageScaffold";

export default function MessageTeacherPage() {
  return (
    <PageScaffold
      title="Message Teacher"
      subtitle="Contact class and subject teachers"
      primaryAction="New Message"
      stats={[
        { label: "Open Threads", value: "3" },
        { label: "Unread", value: "2" },
        { label: "Teachers", value: "14" },
        { label: "Resolved", value: "8" },
      ]}
      items={[
        {
          title: "Mathematics Teacher",
          description: "Question about assessment corrections",
          meta: "Unread",
        },
        {
          title: "Class Teacher",
          description: "Attendance follow-up",
          meta: "Open",
        },
      ]}
    />
  );
}
