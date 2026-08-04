import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaKey, FaUserSlash, FaUserCheck } from "react-icons/fa";

import adminService from "../../services/adminService";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { asArray, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/common/StatusBadge";

const emptyForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  role: "",
  phoneNumber: "",
};

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
];

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { data, loading, error, refetch } = useApi(adminService.getUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState(null);

  const myUserId = currentUser?._id || currentUser?.id;

  const rows = asArray(data).map((user) => {
    const name = displayName(user);
    const isSelf = myUserId && String(user._id) === String(myUserId);
    return {
      _id: user._id,
      name: isSelf ? `${name} (you)` : name,
      username: user.username || "N/A",
      email: user.email || "N/A",
      phoneNumber: user.phoneNumber || "N/A",
      role: user.role || "N/A",
      status: user.isActive === false ? "inactive" : "active",
      __doc: user,
      __self: Boolean(isSelf),
      __search:
        `${name} ${user.username} ${user.email} ${user.role}`.toLowerCase(),
    };
  });

  const filtered = rows.filter(
    (row) =>
      row.__search.includes(search.toLowerCase()) &&
      (!roleFilter || row.role === roleFilter),
  );

  const toggleStatus = async (row) => {
    setStatusBusyId(row._id);
    try {
      const activate = row.__doc.isActive === false;
      await adminService.updateUserStatus(row._id, { isActive: activate });
      toast.success(
        activate
          ? `${row.__doc.username} activated`
          : `${row.__doc.username} deactivated`,
      );
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setStatusBusyId(null);
    }
  };

  const openEdit = (user) => {
    setSelected(user);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      role: user.role || "",
      phoneNumber: user.phoneNumber || "",
    });
    setFormOpen(true);
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phoneNumber" },
    {
      header: "Role",
      accessor: "role",
      render: (row) => <span className="capitalize">{row.role}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            title="Edit user"
            onClick={() => openEdit(row.__doc)}
          />
          {!row.__self && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={FaKey}
                title="Reset password"
                onClick={() => {
                  setSelected(row.__doc);
                  setNewPassword("");
                  setResetOpen(true);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={row.__doc.isActive === false ? FaUserCheck : FaUserSlash}
                title={
                  row.__doc.isActive === false
                    ? "Activate user"
                    : "Deactivate user"
                }
                loading={statusBusyId === row._id}
                onClick={() => toggleStatus(row)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          phoneNumber: form.phoneNumber || undefined,
          role: form.role,
        };
        await adminService.updateUser(selected._id, payload);
        toast.success("User updated");
      } else {
        const payload = { ...form };
        if (!payload.phoneNumber) delete payload.phoneNumber;
        await adminService.createUser(payload);
        toast.success("User created successfully");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      await adminService.resetUserPassword(selected._id, { newPassword });
      toast.success(
        `Password reset for ${displayName(selected)}, they've been signed out everywhere`,
      );
      setResetOpen(false);
      setSelected(null);
      setNewPassword("");
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="User Management"
        subtitle="All system accounts across roles"
        actionLabel="Create User"
        onAdd={openCreate}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No users found"
        emptyDescription="Create the first user account."
        toolbar={
          <div className="w-full sm:w-48">
            <Select
              name="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={roleOptions}
              placeholder="All roles"
            />
          </div>
        }
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit User" : "Create User"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={set("firstName")}
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={set("lastName")}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={set("username")}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            required
          />
        </div>
        {!selected && (
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={set("password")}
            required
          />
        )}
        <Select
          label="Role"
          name="role"
          value={form.role}
          onChange={set("role")}
          options={roleOptions}
          placeholder="Select role"
          required
        />
        <Input
          label="Phone Number"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={set("phoneNumber")}
        />
        {selected && (
          <p className="text-xs text-slate-gray">
            Passwords are changed from the key icon on the row: the user is
            signed out everywhere when their password is reset.
          </p>
        )}
      </FormModal>

      <FormModal
        isOpen={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setSelected(null);
        }}
        title={`Reset Password: ${displayName(selected) || "User"}`}
        onSubmit={handleResetPassword}
        loading={saving}
        submitLabel="Reset Password"
        maxWidth="md"
      >
        <Input
          label="New Password"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
        />
        <p className="text-xs text-slate-gray">
          All of the user's existing sessions are invalidated, they will sign in
          with the new password on their next visit.
        </p>
      </FormModal>
    </>
  );
}
