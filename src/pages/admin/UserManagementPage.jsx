import { useState } from "react";
import toast from "react-hot-toast";

import adminService from "../../services/adminService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
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
  const { data, loading, error, refetch } = useApi(adminService.getUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((user) => {
    const name = displayName(user);
    return {
      _id: user._id,
      name,
      username: user.username || "—",
      email: user.email || "—",
      phoneNumber: user.phoneNumber || "—",
      role: user.role || "—",
      status: user.isActive === false ? "inactive" : "active",
      __search: `${name} ${user.username} ${user.email} ${user.role}`.toLowerCase(),
    };
  });

  const filtered = rows.filter(
    (row) =>
      row.__search.includes(search.toLowerCase()) &&
      (!roleFilter || row.role === roleFilter),
  );

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
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.phoneNumber) delete payload.phoneNumber;
      await adminService.createUser(payload);
      toast.success("User created successfully");
      setFormOpen(false);
      setForm(emptyForm);
      refetch();
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
        onAdd={() => setFormOpen(true)}
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
        onClose={() => setFormOpen(false)}
        title="Create User"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" name="firstName" value={form.firstName} onChange={set("firstName")} required />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={set("lastName")} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Username" name="username" value={form.username} onChange={set("username")} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={set("email")} required />
        </div>
        <Input label="Password" name="password" type="password" value={form.password} onChange={set("password")} required />
        <Select
          label="Role"
          name="role"
          value={form.role}
          onChange={set("role")}
          options={roleOptions}
          placeholder="Select role"
          required
        />
        <Input label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={set("phoneNumber")} />
      </FormModal>
    </>
  );
}
