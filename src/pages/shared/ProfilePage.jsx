import PageScaffold from "../PageScaffold";

export default function ProfilePage() {
  return (
    <PageScaffold
      title="Profile"
      subtitle="Account details and school profile"
      primaryAction="Edit Profile"
      stats={[
        { label: "Status", value: "Active" },
        { label: "Role", value: "User" },
        { label: "Security", value: "Good" },
        { label: "Linked Devices", value: "1" },
      ]}
      items={[
        {
          title: "Personal Information",
          description: "Name, email, and phone number",
          meta: "Complete",
        },
        {
          title: "Account Security",
          description: "Password and login activity",
          meta: "Review",
        },
      ]}
    />
  );
}
