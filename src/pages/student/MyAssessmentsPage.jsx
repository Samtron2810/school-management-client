import PageScaffold from "../PageScaffold";

export default function MyAssessmentsPage() {
  return (
    <PageScaffold
      title="My Assessments"
      subtitle="Upcoming and completed assessments"
      primaryAction="Start Available"
      stats={[
        { label: "Upcoming", value: "3" },
        { label: "Submitted", value: "12" },
        { label: "Graded", value: "10" },
        { label: "Average", value: "76%" },
      ]}
      items={[
        {
          title: "Mathematics Quiz",
          description: "Fractions and decimals",
          meta: "Open",
        },
        {
          title: "English Essay",
          description: "Argumentative writing",
          meta: "Due Friday",
        },
      ]}
    />
  );
}
