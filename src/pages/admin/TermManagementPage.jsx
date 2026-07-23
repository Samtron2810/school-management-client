import { useState } from "react";
import toast from "react-hot-toast";

import termService from "../../services/termService";
import useApi from "../../hooks/useApi";
import { asArray } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import StatusBadge from "../../components/common/StatusBadge";

const emptyForm = { name: "", startDate: "", endDate: "" };

export default function TermManagementPage() {
  const { data, loading, error, refetch } = useApi(termService.list);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const rows = asArray(data).map((term) => {
    const active =
      term.isCurrent ||
      (term.startDate && term.endDate && new Date(term.startDate) <= now && now <= new Date(term.endDate));
    return {
      _id: term._id,
      name: term.name || "—",
      startDate: formatDate(term.startDate) || "—",
      endDate: formatDate(term.endDate) || "—",
      status: active ? "active" : "inactive",
      __search: `${term.name}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Term", accessor: "name" },
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
      await termService.create(form);
      toast.success("Term created successfully");
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
        title="Term Management"
        subtitle="Academic terms within sessions"
        actionLabel="Add Term"
        onAdd={() => setFormOpen(true)}
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
        onClose={() => setFormOpen(false)}
        title="Add Term"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Input label="Term Name" name="name" value={form.name} onChange={set("name")} placeholder="e.g. First Term" required />
        <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={set("startDate")} required />
        <Input label="End Date" name="endDate" type="date" value={form.endDate} onChange={set("endDate")} required />
      </FormModal>
    </>
  );
}
