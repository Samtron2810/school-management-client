import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/common/StatusBadge";

const levelOptions = [
  { value: "Creche", label: "Creche" },
  { value: "Nursery", label: "Nursery" },
  { value: "Primary", label: "Primary" },
  { value: "JSS", label: "JSS" },
  { value: "SSS", label: "SSS" },
];

const emptyForm = { className: "", arm: "", level: "JSS", description: "" };

export default function ClassManagementPage() {
  const { data, loading, error, refetch } = useApi(classService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((schoolClass) => ({
    _id: schoolClass._id,
    class: classLabel(schoolClass),
    level: schoolClass.level || "—",
    arm: schoolClass.arm || "—",
    status: schoolClass.isActive === false ? "inactive" : "active",
    __doc: schoolClass,
    __search:
      `${schoolClass.className} ${schoolClass.arm} ${schoolClass.level}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Class", accessor: "class" },
    { header: "Arm", accessor: "arm" },
    { header: "Level", accessor: "level" },
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
            title="Edit class"
            onClick={() => openEdit(row.__doc)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            title="Delete class"
            onClick={() => {
              setSelected(row.__doc);
              setDeleteOpen(true);
            }}
          />
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

  const openEdit = (schoolClass) => {
    setSelected(schoolClass);
    setForm({
      className: schoolClass.className || "",
      arm: schoolClass.arm || "",
      level: schoolClass.level || "JSS",
      description: schoolClass.description || "",
      isActive: schoolClass.isActive !== false,
    });
    setFormOpen(true);
  };

  const buildPayload = () => {
    const payload = {
      className: form.className,
      arm: form.arm || undefined,
      level: form.level,
      description: form.description || undefined,
    };
    if (selected) payload.isActive = form.isActive;
    return payload;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await classService.update(selected._id, buildPayload());
        toast.success("Class updated");
      } else {
        await classService.create(buildPayload());
        toast.success("Class created successfully");
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

  const handleDelete = async () => {
    setSaving(true);
    try {
      await classService.remove(selected._id);
      toast.success("Class deleted");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // server blocks deleting a class with enrollments/class-subjects
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
        onAdd={openCreate}
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
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Class" : "Add Class"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Class Name"
            name="className"
            value={form.className}
            onChange={set("className")}
            placeholder="e.g. JSS 1"
            required
          />
          <Input
            label="Arm"
            name="arm"
            value={form.arm}
            onChange={set("arm")}
            placeholder="e.g. A"
          />
        </div>
        <Select
          label="Level"
          name="level"
          value={form.level}
          onChange={set("level")}
          options={levelOptions}
          required
        />
        <Input
          label="Description"
          name="description"
          value={form.description}
          onChange={set("description")}
          placeholder="Optional"
        />
        {selected && (
          <div className="flex items-center gap-3">
            <input
              id="class-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 accent-coral"
            />
            <label htmlFor="class-active" className="text-sm text-primary">
              Class is active
            </label>
          </div>
        )}
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Delete ${selected ? classLabel(selected) : "this class"}? The server will refuse while enrollments or class subjects still reference it.`}
      />
    </>
  );
}
