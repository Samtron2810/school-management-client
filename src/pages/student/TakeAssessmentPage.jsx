import PageScaffold from "../PageScaffold";

export default function TakeAssessmentPage() {
  return (
    <PageScaffold
      title="Take Assessment"
      subtitle="Open assessments assigned to you"
      primaryAction="Begin"
      stats={[
        { label: "Open", value: "2" },
        { label: "Due Soon", value: "1" },
        { label: "Completed", value: "12" },
        { label: "Time Left", value: "3 days" },
      ]}
      items={[
        {
          title: "Mathematics Quiz",
          description: "20 questions, 30 minutes",
          meta: "Open",
        },
        {
          title: "English Essay",
          description: "Upload your written response",
          meta: "Due Friday",
        },
      ]}
    />
  );
}
