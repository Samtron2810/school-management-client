import PageScaffold from "../PageScaffold";

export default function MyResultsPage() {
  return (
    <PageScaffold
      title="My Results"
      subtitle="Assessment scores and subject performance"
      primaryAction="Download"
      stats={[
        { label: "Average", value: "76%" },
        { label: "Best Subject", value: "Math" },
        { label: "Improved", value: "5" },
        { label: "Pending Scores", value: "2" },
      ]}
      items={[
        {
          title: "Mathematics Quiz",
          description: "Fractions and decimals",
          meta: "84%",
        },
        {
          title: "Basic Science Test",
          description: "Matter and energy",
          meta: "78%",
        },
      ]}
    />
  );
}
