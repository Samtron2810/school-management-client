import PageScaffold from "../PageScaffold";

export default function LessonPlanPage() {
  return (
    <PageScaffold
      title="Lesson Plans"
      subtitle="Prepare upcoming classroom work"
      primaryAction="New Plan"
      stats={[
        { label: "This Week", value: "12" },
        { label: "Approved", value: "8" },
        { label: "Draft", value: "4" },
        { label: "Overdue", value: "1" },
      ]}
      items={[
        {
          title: "Algebra Introduction",
          description: "Objectives, activities, and exercises",
          meta: "Draft",
        },
        {
          title: "Electric Circuits",
          description: "Practical lesson outline",
          meta: "Approved",
        },
      ]}
    />
  );
}
