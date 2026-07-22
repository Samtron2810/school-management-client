import PageScaffold from "../PageScaffold";

export default function MySubjectsPage() {
  return (
    <PageScaffold
      title="My Subjects"
      subtitle="Subjects registered for the current term"
      primaryAction="View Lessons"
      stats={[
        { label: "Core Subjects", value: "6" },
        { label: "Electives", value: "2" },
        { label: "Teachers", value: "8" },
        { label: "Assessments", value: "5" },
      ]}
      items={[
        {
          title: "Mathematics",
          description: "Number work, algebra, and geometry",
          meta: "Mr. Ade",
        },
        {
          title: "Basic Science",
          description: "Energy, matter, and living systems",
          meta: "Mrs. Musa",
        },
      ]}
    />
  );
}
