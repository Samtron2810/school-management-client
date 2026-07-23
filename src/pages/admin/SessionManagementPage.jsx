import { useState } from "react";
import toast from "react-hot-toast";

import sessionService from "../../services/sessionService";
import useApi from "../../hooks/useApi";
import { asArray } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import StatusBadge from "../../components/common/StatusBadge";

const emptyForm = { name: "", startDate: "", endDate: "" };

export default function SessionManagementPage() {
  const { data, loading, error, refetch } = useApi(sessionService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const rows = asArray(data).map((session) => {
    const active =
      session.isCurrent ||
      (session.startDate && session.endDate && new Date(session.startDate) <= now && now <= new Date(session.endDate));
    return {
      _id: session._id,
      name: session.name || "—",
      startDate: formatDate(session.startDate) || "—",
      endDate: formatDate(session.endDate) || "—",
      status: active ? "active" : "inactive",
      __search: `${session.name}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Session", accessor: "name" },
    { header: "Starts", accessor: "startDate" },
    { header: "Ends", accessor: "endDate" },
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
      await sessionService.create(form);
      toast.success("Session created successfully");
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
        title="Session Management"
        subtitle="Academic sessions (e.g. 2025/2026)"
        actionLabel="Add Session"
        onAdd={() => setFormOpen(true)}
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
        onClose={() => setFormOpen(false)}
        title="Add Session"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Input label="Session Name" name="name" value={form.name} onChange={set("name")} placeholder="e.g. 2025/2026" required />
        <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={set("startDate")} required />
        <Input label="End Date" name="endDate" type="date" value={form.endDate} onChange={set("endDate")} required />
      </FormModal>
    </>
  );
}
