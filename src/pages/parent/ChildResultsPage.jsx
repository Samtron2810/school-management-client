import PageScaffold from "../PageScaffold";

export default function ChildResultsPage() {
  return (
    <PageScaffold
      title="Child Results"
      subtitle="Assessment performance by child"
      primaryAction="Export"
      stats={[
        { label: "Average", value: "78%" },
        { label: "Improved", value: "7" },
        { label: "Pending Scores", value: "3" },
        { label: "Subjects", value: "12" },
      ]}
      items={[
        {
          title: "Amina Yusuf",
          description: "Latest assessment average",
          meta: "81%",
        },
        {
          title: "Tunde Yusuf",
          description: "Latest assessment average",
          meta: "75%",
        },
      ]}
    />
  );
}
