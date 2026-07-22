import PageScaffold from "../PageScaffold";

export default function MySubjectsPage() {
  return (
    <PageScaffold
      title="My Subjects"
      subtitle="Subjects assigned to your classes"
      primaryAction="Plan Lesson"
      stats={[
        { label: "Assigned Subjects", value: "4" },
        { label: "Weekly Lessons", value: "18" },
        { label: "Class Groups", value: "6" },
        { label: "Pending Plans", value: "3" },
      ]}
      items={[
        {
          title: "Mathematics",
          description: "JSS 1 and JSS 2 subject allocation",
          meta: "8 lessons",
        },
        {
          title: "Physics",
          description: "SSS 1 theory and practical sessions",
          meta: "5 lessons",
        },
        {
          title: "Basic Science",
          description: "Foundation science classes",
          meta: "5 lessons",
        },
      ]}
    />
  );
}
