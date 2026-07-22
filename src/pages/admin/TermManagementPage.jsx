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

const initialTerms = [
  {
    id: 1,
    name: "First Term",
    session: "2025/2026",
    startDate: "2026-01-10",
    endDate: "2026-04-10",
    status: "active",
  },
  {
    id: 2,
    name: "Second Term",
    session: "2025/2026",
    startDate: "2026-05-01",
    endDate: "2026-08-01",
    status: "upcoming",
  },
  {
    id: 3,
    name: "Third Term",
    session: "2024/2025",
    startDate: "2025-09-01",
    endDate: "2025-12-20",
    status: "archived",
  },
];

export default function TermManagementPage() {
  const [terms, setTerms] = useState(initialTerms);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: "",
    session: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
  });

  const filtered = terms.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Term Name", accessor: "name" },
    { header: "Session", accessor: "session" },
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
      setTerms(
        terms.map((t) => (t.id === selected.id ? { ...t, ...form } : t)),
      );
    } else {
      setTerms([...terms, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({
      name: "",
      session: "",
      startDate: "",
      endDate: "",
      status: "upcoming",
    });
  };

  const handleDelete = () => {
    setTerms(terms.filter((t) => t.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Term Management"
        subtitle="Manage academic terms"
        actions={
          <ActionButton
            label="Add Term"
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
          placeholder="Search terms..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No terms found"
          description="Get started by adding a new term."
          actionLabel="Add Term"
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
        title={selected ? "Edit Term" : "Add Term"}
        onSubmit={handleSave}
      >
        <Input
          label="Term Name"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Session"
          name="session"
          value={form.session}
          onChange={(e) => setForm({ ...form, session: e.target.value })}
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
        title="Delete Term"
        message="Are you sure you want to delete this term?"
      />
    </div>
  );
}
