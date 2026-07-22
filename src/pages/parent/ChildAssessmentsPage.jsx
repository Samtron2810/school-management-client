import PageScaffold from "../PageScaffold";

export default function ChildAssessmentsPage() {
  return (
    <PageScaffold
      title="Child Assessments"
      subtitle="Assessment schedules and submissions"
      primaryAction="View Calendar"
      stats={[
        { label: "Upcoming", value: "4" },
        { label: "Submitted", value: "18" },
        { label: "Graded", value: "15" },
        { label: "Pending", value: "3" },
      ]}
      items={[
        {
          title: "Mathematics Quiz",
          description: "Amina Yusuf",
          meta: "Friday",
        },
        {
          title: "Basic Science Test",
          description: "Tunde Yusuf",
          meta: "Next week",
        },
      ]}
    />
  );
}
