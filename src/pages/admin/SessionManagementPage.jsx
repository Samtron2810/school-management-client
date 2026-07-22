import { useState } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaTrashAlt,
  FaEdit,
  FaEye,
} from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/tables/DataTable";
import ActionButton from "../../components/buttons/ActionButton";
import SearchInput from "../../components/common/SearchInput";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const initialSessions = [
  {
    id: 1,
    name: "2025/2026 First Term",
    startDate: "2026-01-10",
    endDate: "2026-04-10",
    status: "active",
  },
  {
    id: 2,
    name: "2025/2026 Second Term",
    startDate: "2026-05-01",
    endDate: "2026-08-01",
    status: "upcoming",
  },
  {
    id: 3,
    name: "2024/2025 Third Term",
    startDate: "2025-09-01",
    endDate: "2025-12-20",
    status: "archived",
  },
];

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState(initialSessions);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
  });

  const filtered = sessions.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Session Name", accessor: "name" },
    { header: "Start Date", accessor: "startDate" },
    { header: "End Date", accessor: "endDate" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={FaEye} onClick={() => {}} />
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            onClick={() => {
              setSelected(row);
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            onClick={() => {
              setSelected(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleSave = () => {
    if (selected) {
      setSessions(
        sessions.map((s) => (s.id === selected.id ? { ...s, ...form } : s)),
      );
    } else {
      setSessions([...sessions, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({ name: "", startDate: "", endDate: "", status: "upcoming" });
  };

  const handleDelete = () => {
    setSessions(sessions.filter((s) => s.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Session Management"
        subtitle="Manage academic sessions and terms"
        actions={
          <ActionButton
            label="Add Session"
            icon={FaPlus}
            onClick={() => {
              setSelected(null);
              setFormOpen(true);
            }}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search sessions..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No sessions found"
          description="Get started by adding a new session."
          actionLabel="Add Session"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Session" : "Add Session"}
        onSubmit={handleSave}
      >
        <Input
          label="Session Name"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          required
        />
        <Input
          label="End Date"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          required
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[
            { value: "active", label: "Active" },
            { value: "upcoming", label: "Upcoming" },
            { value: "archived", label: "Archived" },
          ]}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Session"
        message="Are you sure you want to delete this session?"
      />
    </div>
  );
}
