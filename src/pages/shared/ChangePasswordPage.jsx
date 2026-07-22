import PageScaffold from "../PageScaffold";

export default function ChangePasswordPage() {
  return (
    <PageScaffold
      title="Change Password"
      subtitle="Update account password"
      primaryAction="Save Password"
      stats={[
        { label: "Password Age", value: "48 days" },
        { label: "MFA", value: "Off" },
        { label: "Sessions", value: "1" },
        { label: "Status", value: "Secure" },
      ]}
      items={[
        {
          title: "Current Password",
          description: "Enter your existing password",
          meta: "Required",
        },
        {
          title: "New Password",
          description: "Use a strong password you do not reuse",
          meta: "Required",
        },
      ]}
    />
  );
}
