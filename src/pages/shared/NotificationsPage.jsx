import PageScaffold from "../PageScaffold";

export default function NotificationsPage() {
  return (
    <PageScaffold
      title="Notifications"
      subtitle="Recent system and school updates"
      primaryAction="Mark Read"
      stats={[
        { label: "Unread", value: "5" },
        { label: "Today", value: "4" },
        { label: "Important", value: "2" },
        { label: "Archived", value: "20" },
      ]}
      items={[
        {
          title: "New assessment posted",
          description: "Mathematics quiz is now available",
          meta: "Today",
        },
        {
          title: "Report update",
          description: "Teacher comments were updated",
          meta: "Yesterday",
        },
      ]}
    />
  );
}
