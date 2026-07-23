import { useState } from "react";
import toast from "react-hot-toast";
import { FaLink } from "react-icons/fa";

import parentService from "../../services/parentService";
import studentService from "../../services/studentService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";
import suggestId from "../../utils/idSuggestion";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/common/StatusBadge";

const ID_PREFIX = "PAR-";

const emptyForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  parentId: "",
  gender: "",
  occupation: "",
  workplace: "",
  address: "",
};

const emptyLinkForm = { parent: "", student: "", relationship: "" };

export default function ParentManagementPage() {
  const { data, loading, error, refetch } = useApi(parentService.list);
  const studentsApi = useApi(studentService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [linkForm, setLinkForm] = useState(emptyLinkForm);
  const [saving, setSaving] = useState(false);

  // Backend requires a caller-supplied unique parentId with no update
  // route, so we pre-fill the next sequential ID (editable).
  const openForm = () => {
    const existingIds = asArray(data).map((parent) => parent.parentId);
    setForm({ ...emptyForm, parentId: suggestId(ID_PREFIX, existingIds) });
    setFormOpen(true);
  };

  const rows = asArray(data).map((parent) => {
    const user = parent.user || parent;
    const name = displayName(user);
    return {
      _id: parent._id,
      name,
      username: user.username || "—",
      email: user.email || "—",
      occupation: parent.occupation || "—",
      workplace: parent.workplace || "—",
      status: parent.isActive === false ? "inactive" : "active",
      __search: `${name} ${user.username} ${user.email} ${parent.occupation}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const parentOptions = rows.map((row) => ({ value: row._id, label: row.name }));
  const studentOptions = asArray(studentsApi.data).map((student) => ({
    value: student._id,
    label: displayName(student.user || student),
  }));

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Occupation", accessor: "occupation" },
    { header: "Workplace", accessor: "workplace" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setLink = (field) => (e) =>
    setLinkForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "") delete payload[key];
      });
      await parentService.create(payload);
      toast.success("Parent created successfully");
      setFormOpen(false);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const submitLink = async () => {
    setSaving(true);
    try {
      const payload = { ...linkForm };
      if (!payload.relationship) delete payload.relationship;
      await parentService.linkStudent(payload);
      toast.success("Parent linked to student");
      setLinkOpen(false);
      setLinkForm(emptyLinkForm);
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Parent Management"
        subtitle="View parents and link them to students"
        actionLabel="Add Parent"
        onAdd={openForm}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search parents..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No parents found"
        emptyDescription="Register your first parent to get started."
        toolbar={
          <Button variant="outline" icon={FaLink} onClick={() => setLinkOpen(true)}>
            Link to Student
          </Button>
        }
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Parent"
        onSubmit={submit}
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
          <Input label="Parent ID" name="parentId" value={form.parentId} onChange={set("parentId")} placeholder="Auto-suggested; edit to match your numbering" />
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
          <Input label="Occupation" name="occupation" value={form.occupation} onChange={set("occupation")} />
          <Input label="Workplace" name="workplace" value={form.workplace} onChange={set("workplace")} />
        </div>
        <Textarea label="Address" name="address" value={form.address} onChange={set("address")} rows={2} />
      </FormModal>

      <FormModal
        isOpen={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Link Parent to Student"
        onSubmit={submitLink}
        loading={saving}
      >
        <Select
          label="Parent"
          name="parent"
          value={linkForm.parent}
          onChange={setLink("parent")}
          options={parentOptions}
          placeholder="Select parent"
          required
        />
        <Select
          label="Student"
          name="student"
          value={linkForm.student}
          onChange={setLink("student")}
          options={studentOptions}
          placeholder="Select student"
          required
        />
        <Input
          label="Relationship"
          name="relationship"
          value={linkForm.relationship}
          onChange={setLink("relationship")}
          placeholder="e.g. Father, Mother, Guardian"
        />
      </FormModal>
    </>
  );
}
