import PageScaffold from "../PageScaffold";

export default function GradeAssessmentPage() {
  return (
    <PageScaffold
      title="Grade Assessments"
      subtitle="Review submissions and publish scores"
      primaryAction="Start Grading"
      stats={[
        { label: "Pending", value: "17" },
        { label: "Graded", value: "86" },
        { label: "Returned", value: "64" },
        { label: "Average Score", value: "72%" },
      ]}
      items={[
        {
          title: "Physics Midterm",
          description: "28 student submissions",
          meta: "11 pending",
        },
        {
          title: "Mathematics Quiz",
          description: "35 student submissions",
          meta: "6 pending",
        },
      ]}
    />
  );
}
