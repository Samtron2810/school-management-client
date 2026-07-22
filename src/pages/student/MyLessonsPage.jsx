import PageScaffold from "../PageScaffold";

export default function MyLessonsPage() {
  return (
    <PageScaffold
      title="My Lessons"
      subtitle="Lesson notes and class materials"
      primaryAction="Open Latest"
      stats={[
        { label: "New Lessons", value: "7" },
        { label: "Completed", value: "21" },
        { label: "Bookmarked", value: "4" },
        { label: "Subjects", value: "8" },
      ]}
      items={[
        {
          title: "Introduction to Algebra",
          description: "Variables, expressions, and examples",
          meta: "Mathematics",
        },
        {
          title: "The Water Cycle",
          description: "Evaporation, condensation, and rainfall",
          meta: "Science",
        },
      ]}
    />
  );
}
