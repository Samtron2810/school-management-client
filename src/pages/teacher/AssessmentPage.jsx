import PageScaffold from "../PageScaffold";

export default function AssessmentPage() {
  return (
    <PageScaffold
      title="Assessments"
      subtitle="Create and manage class assessments"
      primaryAction="New Assessment"
      stats={[
        { label: "Drafts", value: "5" },
        { label: "Published", value: "9" },
        { label: "Submissions", value: "124" },
        { label: "To Grade", value: "17" },
      ]}
      items={[
        {
          title: "JSS 1 Mathematics Quiz",
          description: "Fractions and decimals",
          meta: "Published",
        },
        {
          title: "SSS 1 Physics Test",
          description: "Motion and force",
          meta: "Draft",
        },
      ]}
    />
  );
}
