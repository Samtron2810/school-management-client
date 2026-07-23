import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import sessionService from "../../services/sessionService";
import useApi from "../../hooks/useApi";
import { asArray } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import StatusBadge from "../../components/common/StatusBadge";

const emptyForm = { name: "", startDate: "", endDate: "", isCurrent: false };
const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

export default function SessionManagementPage() {
  const { data, loading, error, refetch } = useApi(sessionService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((session) => ({
    _id: session._id,
    name: session.name || "—",
    startDate: formatDate(session.startDate) || "—",
    endDate: formatDate(session.endDate) || "—",
    status: session.isCurrent ? "current" : "inactive",
    __doc: session,
    __search: `${session.name}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Session", accessor: "name" },
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

  const openEdit = (session) => {
    setSelected(session);
    setForm({
      name: session.name || "",
      startDate: toDateInput(session.startDate),
      endDate: toDateInput(session.endDate),
      isCurrent: Boolean(session.isCurrent),
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await sessionService.update(selected._id, {
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
          isCurrent: form.isCurrent,
        });
        toast.success("Session updated");
      } else {
        await sessionService.create({
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
        });
        toast.success("Session created successfully");
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
      await sessionService.remove(selected._id);
      toast.success("Session deleted");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // server blocks deleting the current session or one with references
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Session Management"
        subtitle="Academic sessions (e.g. 2025/2026)"
        actionLabel="Add Session"
        onAdd={openCreate}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sessions..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No sessions found"
        emptyDescription="Create the first academic session."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Session" : "Add Session"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Input label="Session Name" name="name" value={form.name} onChange={set("name")} placeholder="e.g. 2025/2026" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={set("startDate")} required />
          <Input label="End Date" name="endDate" type="date" value={form.endDate} onChange={set("endDate")} required />
        </div>
        {selected && (
          <Toggle
            label="Current session"
            enabled={form.isCurrent}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, isCurrent: value }))
            }
          />
        )}
        {selected && form.isCurrent && !selected.isCurrent && (
          <p className="text-xs text-slate-gray">
            Saving will make this the current session and clear the flag on
            every other session.
          </p>
        )}
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Session"
        message={`Delete session "${selected?.name}"? The server will refuse if it is the current session or still has terms and enrollments attached.`}
      />
    </>
  );
}
