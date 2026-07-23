import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit } from "react-icons/fa";

import studentService from "../../services/studentService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";
import suggestId from "../../utils/idSuggestion";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/common/StatusBadge";

const ID_PREFIX = "STU-";

const emptyForm = {
  firstName: "",
  lastName: "",
  otherName: "",
  username: "",
  email: "",
  password: "",
  admissionNumber: "",
  gender: "Male",
  dateOfBirth: "",
  admissionDate: "",
};

export default function StudentManagementPage() {
  const { data, loading, error, refetch } = useApi(studentService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // The server auto-generates admission numbers from School Settings when
  // the field is left blank — pre-fill the next sequential ID as a hint.
  const openForm = () => {
    setSelected(null);
    const existingIds = asArray(data).map((student) => student.admissionNumber);
    setForm({ ...emptyForm, admissionNumber: suggestId(ID_PREFIX, existingIds) });
    setFormOpen(true);
  };

  const openEdit = (student) => {
    const user = student.user || {};
    setSelected(student);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      otherName: user.otherName || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      admissionNumber: student.admissionNumber || "",
      gender: student.gender || "Male",
      dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : "",
      admissionDate: student.admissionDate ? String(student.admissionDate).slice(0, 10) : "",
      isActive: student.isActive !== false,
    });
    setFormOpen(true);
  };

  const rows = asArray(data).map((student) => {
    const user = student.user || student;
    const name = displayName(user);
    return {
      _id: student._id,
      name,
      username: user.username || "—",
      email: user.email || "—",
      admissionNumber: student.admissionNumber || "—",
      gender: student.gender || "—",
      status: student.isActive === false ? "inactive" : "active",
      __doc: student,
      __search: `${name} ${user.username} ${user.email} ${student.admissionNumber}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Admission No.", accessor: "admissionNumber" },
    { header: "Gender", accessor: "gender" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={FaEdit}
          onClick={() => openEdit(row.__doc)}
        />
      ),
    },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          otherName: form.otherName || undefined,
          username: form.username,
          email: form.email,
          admissionNumber: form.admissionNumber || undefined,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth || undefined,
          admissionDate: form.admissionDate || undefined,
          isActive: form.isActive,
        };
        await studentService.update(selected._id, payload);
        toast.success("Student updated");
      } else {
        const payload = { ...form };
        Object.keys(payload).forEach((key) => {
          if (payload[key] === "") delete payload[key];
        });
        await studentService.create(payload);
        toast.success("Student created successfully");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast (e.g. duplicate username)
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Student Management"
        subtitle="View and register students"
        actionLabel="Add Student"
        onAdd={openForm}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search students..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No students found"
        emptyDescription="Register your first student to get started."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Student" : "Add Student"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" name="firstName" value={form.firstName} onChange={set("firstName")} required />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={set("lastName")} required />
        </div>
        <Input label="Other Name" name="otherName" value={form.otherName} onChange={set("otherName")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Username" name="username" value={form.username} onChange={set("username")} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={set("email")} required />
        </div>
        {!selected && (
          <Input label="Password" name="password" type="password" value={form.password} onChange={set("password")} required />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Admission Number" name="admissionNumber" value={form.admissionNumber} onChange={set("admissionNumber")} placeholder="Leave blank to auto-generate" />
          <Select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={set("gender")}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          <Input label="Admission Date" name="admissionDate" type="date" value={form.admissionDate} onChange={set("admissionDate")} />
        </div>
        {selected && (
          <div className="flex items-center gap-3">
            <input
              id="student-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 accent-royal-blue"
            />
            <label htmlFor="student-active" className="text-sm text-primary">
              Student is active
            </label>
          </div>
        )}
        {selected && (
          <p className="text-xs text-slate-gray">
            Passwords are reset from the Users page; inactive students can't
            sign in.
          </p>
        )}
      </FormModal>
    </>
  );
}
