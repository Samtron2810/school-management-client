import { useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaPhone, FaUserTag } from "react-icons/fa";

import authService from "../../services/authService";
import useApi from "../../hooks/useApi";
import { displayName } from "../../utils/apiData";
import { formatDateTime } from "../../utils/formatDate";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Avatar from "../../components/ui/Avatar";

export default function ProfilePage() {
  const { data: profile, loading, error, refetch } = useApi(authService.me);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setFormError("");
  };

  // PATCH /auth/change-password invalidates every session server-side —
  // so after a successful change we bounce the user back to login.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      setFormError("Please fill in all password fields.");
      return;
    }
    if (form.newPassword.length < 8) {
      setFormError("New password must be at least 8 characters long.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed. Please sign in again.");
      window.location.replace("/login");
    } catch {
      // Interceptor surfaces the server message (e.g. wrong current password).
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading your profile..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const name = displayName(profile) || "User";
  const role = profile?.role || "";

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Your account details and security" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <Avatar src={profile?.avatar} name={name} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-primary">{name}</h2>
              <Badge variant="info" className="mt-1 capitalize">
                {role || "user"}
              </Badge>
            </div>
          </div>

          <dl className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <FaUserTag className="text-royal-blue shrink-0" />
              <div>
                <dt className="text-xs text-slate-gray">Username</dt>
                <dd className="font-medium text-primary">
                  {profile?.username || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-royal-blue shrink-0" />
              <div>
                <dt className="text-xs text-slate-gray">Email</dt>
                <dd className="font-medium text-primary">
                  {profile?.email || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-royal-blue shrink-0" />
              <div>
                <dt className="text-xs text-slate-gray">Phone</dt>
                <dd className="font-medium text-primary">
                  {profile?.phoneNumber || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaLock className="text-royal-blue shrink-0" />
              <div>
                <dt className="text-xs text-slate-gray">Last sign-in</dt>
                <dd className="font-medium text-primary">
                  {profile?.lastLogin
                    ? formatDateTime(profile.lastLogin)
                    : "—"}
                </dd>
              </div>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-primary mb-1">
            Change Password
          </h2>
          <p className="text-xs text-slate-gray mb-4">
            You will be signed out on all devices after changing your password.
          </p>

          {formError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-crimson">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="At least 8 characters"
              required
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat the new password"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
