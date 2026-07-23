import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import subjectService from "../../services/subjectService";
import useApi from "../../hooks/useApi";
import { asArray } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const emptyForm = { name: "", code: "" };

export default function SubjectManagementPage() {
  const { data, loading, error, refetch } = useApi(subjectService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((subject) => ({
    _id: subject._id,
    name: subject.name || "—",
    code: subject.code || "—",
    __doc: subject,
    __search: `${subject.name} ${subject.code}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Subject", accessor: "name" },
    { header: "Code", accessor: "code" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            onClick={() => openEdit(row.__doc)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
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

  const openEdit = (subject) => {
    setSelected(subject);
    setForm({ name: subject.name || "", code: subject.code || "" });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await subjectService.update(selected._id, {
          name: form.name,
          code: form.code,
        });
        toast.success("Subject updated");
      } else {
        await subjectService.create({ name: form.name, code: form.code });
        toast.success("Subject created successfully");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast (e.g. duplicate code)
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await subjectService.remove(selected._id);
      toast.success("Subject deleted");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // server blocks deleting a subject in use
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
        onAdd={openCreate}
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
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Subject" : "Add Subject"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Input label="Subject Name" name="name" value={form.name} onChange={set("name")} placeholder="e.g. Mathematics" required />
        <Input label="Code" name="code" value={form.code} onChange={set("code")} placeholder="e.g. MTH101" required />
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message={`Delete "${selected?.name}"? The server will refuse while class subjects or teacher assignments still reference it.`}
      />
    </>
  );
}
