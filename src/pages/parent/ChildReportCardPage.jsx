import PageScaffold from "../PageScaffold";

export default function ChildReportCardPage() {
  return (
    <PageScaffold
      title="Child Report Cards"
      subtitle="Term reports for linked children"
      primaryAction="Download"
      stats={[
        { label: "Available", value: "2" },
        { label: "Draft", value: "1" },
        { label: "Average", value: "78%" },
        { label: "Comments", value: "4" },
      ]}
      items={[
        {
          title: "Amina Yusuf Report",
          description: "First term academic report",
          meta: "Available",
        },
        {
          title: "Tunde Yusuf Report",
          description: "First term academic report",
          meta: "Draft",
        },
      ]}
    />
  );
}
