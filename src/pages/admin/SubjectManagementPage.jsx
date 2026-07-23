import { useState } from "react";
import toast from "react-hot-toast";

import subjectService from "../../services/subjectService";
import useApi from "../../hooks/useApi";
import { asArray } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";

const emptyForm = { name: "", code: "" };

export default function SubjectManagementPage() {
  const { data, loading, error, refetch } = useApi(subjectService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((subject) => ({
    _id: subject._id,
    name: subject.name || "—",
    code: subject.code || "—",
    __search: `${subject.name} ${subject.code}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Subject", accessor: "name" },
    { header: "Code", accessor: "code" },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await subjectService.create(form);
      toast.success("Subject created successfully");
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
        title="Subject Management"
        subtitle="Subjects offered by the school"
        actionLabel="Add Subject"
        onAdd={() => setFormOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subjects..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No subjects found"
        emptyDescription="Create the first subject (e.g. Mathematics, MTH101)."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Subject"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Input label="Subject Name" name="name" value={form.name} onChange={set("name")} placeholder="e.g. Mathematics" required />
        <Input label="Code" name="code" value={form.code} onChange={set("code")} placeholder="e.g. MTH101" required />
      </FormModal>
    </>
  );
}
