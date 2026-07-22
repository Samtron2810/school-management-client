import PageScaffold from "../PageScaffold";

export default function ChildLessonsPage() {
  return (
    <PageScaffold
      title="Child Lessons"
      subtitle="Recent lesson notes and materials"
      primaryAction="Open Materials"
      stats={[
        { label: "New Lessons", value: "9" },
        { label: "Subjects", value: "12" },
        { label: "Completed", value: "34" },
        { label: "Bookmarked", value: "6" },
      ]}
      items={[
        {
          title: "Algebra Introduction",
          description: "Amina Yusuf, Mathematics",
          meta: "New",
        },
        {
          title: "Creative Writing",
          description: "Tunde Yusuf, English",
          meta: "Viewed",
        },
      ]}
    />
  );
}
