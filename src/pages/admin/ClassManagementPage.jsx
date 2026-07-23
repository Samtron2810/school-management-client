import { useState } from "react";
import toast from "react-hot-toast";

import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";

const emptyForm = { className: "", arm: "", level: "" };

export default function ClassManagementPage() {
  const { data, loading, error, refetch } = useApi(classService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((schoolClass) => ({
    _id: schoolClass._id,
    class: classLabel(schoolClass),
    level: schoolClass.level || "—",
    arm: schoolClass.arm || "—",
    __search: `${schoolClass.className} ${schoolClass.arm} ${schoolClass.level}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Class", accessor: "class" },
    { header: "Arm", accessor: "arm" },
    { header: "Level", accessor: "level" },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.level) delete payload.level;
      await classService.create(payload);
      toast.success("Class created successfully");
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
        title="Class Management"
        subtitle="School classes and arms"
        actionLabel="Add Class"
        onAdd={() => setFormOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search classes..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No classes found"
        emptyDescription="Create the first class (e.g. JSS 1 A)."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Class"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Input label="Class Name" name="className" value={form.className} onChange={set("className")} placeholder="e.g. JSS 1" required />
        <Input label="Arm" name="arm" value={form.arm} onChange={set("arm")} placeholder="e.g. A" required />
        <Input label="Level" name="level" value={form.level} onChange={set("level")} placeholder="e.g. Junior Secondary" />
      </FormModal>
    </>
  );
}
