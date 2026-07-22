import PageScaffold from "../PageScaffold";

export default function QuestionBankPage() {
  return (
    <PageScaffold
      title="Question Bank"
      subtitle="Reusable questions for assessments"
      primaryAction="Add Question"
      stats={[
        { label: "Questions", value: "240" },
        { label: "Subjects", value: "4" },
        { label: "Objective", value: "180" },
        { label: "Theory", value: "60" },
      ]}
      items={[
        {
          title: "Mathematics",
          description: "Algebra, geometry, and number work",
          meta: "96 items",
        },
        {
          title: "Physics",
          description: "Mechanics, waves, and electricity",
          meta: "72 items",
        },
      ]}
    />
  );
}
