import PageScaffold from "../PageScaffold";

export default function ChildrenPage() {
  return (
    <PageScaffold
      title="Children"
      subtitle="Linked student profiles"
      primaryAction="View Profile"
      stats={[
        { label: "Linked Children", value: "2" },
        { label: "Classes", value: "2" },
        { label: "Teachers", value: "14" },
        { label: "Reports", value: "4" },
      ]}
      items={[
        {
          title: "Amina Yusuf",
          description: "JSS 2 Blue",
          meta: "Active",
        },
        {
          title: "Tunde Yusuf",
          description: "Primary 5 Gold",
          meta: "Active",
        },
      ]}
    />
  );
}
