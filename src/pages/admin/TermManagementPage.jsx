import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import termService from "../../services/termService";
import useApi from "../../hooks/useApi";
import { asArray } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import StatusBadge from "../../components/common/StatusBadge";

const termNameOptions = [
  { value: "First Term", label: "First Term" },
  { value: "Second Term", label: "Second Term" },
  { value: "Third Term", label: "Third Term" },
];

const emptyForm = {
  name: "First Term",
  startDate: "",
  endDate: "",
  isCurrent: false,
};
const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

export default function TermManagementPage() {
  // Only terms under the active session are shown here by default.
  const { data, loading, error, refetch } = useApi(() =>
    termService.list({ activeOnly: true }),
  );
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((term) => ({
    _id: term._id,
    name: term.name || "—",
    session: term.session?.name || "—",
    startDate: formatDate(term.startDate) || "—",
    endDate: formatDate(term.endDate) || "—",
    status: term.isCurrent ? "current" : "inactive",
    __doc: term,
    __search: `${term.name} ${term.session?.name}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Term", accessor: "name" },
    { header: "Session", accessor: "session" },
    { header: "Starts", accessor: "startDate" },
    { header: "Ends", accessor: "endDate" },
    {
      header: "Status",
      accessor: "status",
      render: (row) =>
        row.__doc.isCurrent ? (
          <StatusBadge status="active" />
        ) : (
          <span className="text-xs text-slate-gray">—</span>
        ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            title="Edit term"
            onClick={() => openEdit(row.__doc)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            title="Delete term"
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

  const openEdit = (term) => {
    setSelected(term);
    setForm({
      name: term.name || "First Term",
      startDate: toDateInput(term.startDate),
      endDate: toDateInput(term.endDate),
      isCurrent: Boolean(term.isCurrent),
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await termService.update(selected._id, {
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
          isCurrent: form.isCurrent,
        });
        toast.success("Term updated");
      } else {
        // The server attaches the new term to the current session.
        await termService.create({
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
        });
        toast.success("Term created successfully");
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
      await termService.remove(selected._id);
      toast.success("Term deleted");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // server blocks deleting the current term or one with enrollments
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Term Management"
        subtitle="Academic terms within sessions"
        actionLabel="Add Term"
        onAdd={openCreate}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search terms..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No terms found"
        emptyDescription="Create the first academic term (e.g. First Term)."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Term" : "Add Term"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Select
          label="Term Name"
          name="name"
          value={form.name}
          onChange={set("name")}
          options={termNameOptions}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={set("startDate")}
            required
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={set("endDate")}
            required
          />
        </div>
        {selected && (
          <div className="space-y-2">
            <Toggle
              label="Current term"
              enabled={form.isCurrent}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, isCurrent: value }))
              }
            />
            <p className="text-xs text-slate-gray">
              The term stays in its original session (
              {selected.session?.name || "—"}).
              {form.isCurrent &&
                !selected.isCurrent &&
                " Saving clears the flag on the session's other terms."}
            </p>
          </div>
        )}
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Term"
        message={`Delete "${selected?.name}" (${selected?.session?.name || "session"})? The server will refuse if it is the current term or still has enrollments attached.`}
      />
    </>
  );
}
