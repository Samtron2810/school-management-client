import { useState } from "react";
import toast from "react-hot-toast";

import teacherService from "../../services/teacherService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";
import suggestId from "../../utils/idSuggestion";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/common/StatusBadge";

const ID_PREFIX = "TCH-";

const emptyForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  teacherId: "",
  gender: "",
  employmentDate: "",
  phoneNumber: "",
  address: "",
  qualification: "",
  specialization: "",
};

export default function TeacherManagementPage() {
  const { data, loading, error, refetch } = useApi(teacherService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((teacher) => {
    const user = teacher.user || teacher;
    const name = displayName(user);
    return {
      _id: teacher._id,
      name,
      username: user.username || "—",
      email: user.email || "—",
      teacherId: teacher.teacherId || "—",
      gender: teacher.gender || "—",
      phoneNumber: teacher.phoneNumber || user.phoneNumber || "—",
      qualification: teacher.qualification || "—",
      specialization: teacher.specialization || "—",
      employmentDate: formatDate(teacher.employmentDate) || "—",
      status: teacher.isActive === false ? "inactive" : "active",
      __search: `${name} ${user.username} ${user.email} ${teacher.teacherId} ${teacher.qualification} ${teacher.specialization}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Teacher ID", accessor: "teacherId" },
    { header: "Gender", accessor: "gender" },
    { header: "Phone", accessor: "phoneNumber" },
    { header: "Qualification", accessor: "qualification" },
    { header: "Specialization", accessor: "specialization" },
    { header: "Employed", accessor: "employmentDate" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Backend requires a caller-supplied unique teacherId and exposes no
  // update route, so we pre-fill the next sequential ID (editable).
  const openForm = () => {
    const existingIds = asArray(data).map((teacher) => teacher.teacherId);
    setForm({ ...emptyForm, teacherId: suggestId(ID_PREFIX, existingIds) });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") delete payload[key];
      });
      await teacherService.create(payload);
      toast.success("Teacher created successfully");
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
        title="Teacher Management"
        subtitle="View and register teachers"
        actionLabel="Add Teacher"
        onAdd={openForm}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search teachers..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No teachers found"
        emptyDescription="Register your first teacher to get started."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Teacher"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Teacher ID"
            name="teacherId"
            value={form.teacherId}
            onChange={set("teacherId")}
            placeholder="Auto-suggested; edit to match your numbering"
          />
          <Select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={set("gender")}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
            placeholder="Select gender"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={set("phoneNumber")} />
          <Input label="Employment Date" name="employmentDate" type="date" value={form.employmentDate} onChange={set("employmentDate")} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Qualification" name="qualification" value={form.qualification} onChange={set("qualification")} placeholder="e.g. B.Ed, M.Sc" />
          <Input label="Specialization" name="specialization" value={form.specialization} onChange={set("specialization")} placeholder="e.g. Mathematics" />
        </div>
        <Input label="Address" name="address" value={form.address} onChange={set("address")} />
        <p className="text-xs text-slate-gray">
          These profile details can only be set during registration — the
          backend has no teacher-update endpoint.
        </p>
      </FormModal>
    </>
  );
}
