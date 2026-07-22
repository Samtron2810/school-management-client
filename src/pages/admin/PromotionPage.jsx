import { useState } from "react";
import {
  FaUserGraduate,
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

const initialPromotions = [
  {
    id: 1,
    student: "John Doe",
    currentClass: "JSS 2",
    newClass: "JSS 3",
    session: "2025/2026",
    status: "completed",
  },
  {
    id: 2,
    student: "Jane Smith",
    currentClass: "SSS 1",
    newClass: "SSS 2",
    session: "2025/2026",
    status: "pending",
  },
  {
    id: 3,
    student: "Bob Johnson",
    currentClass: "JSS 1",
    newClass: "JSS 2",
    session: "2025/2026",
    status: "completed",
  },
];

export default function PromotionPage() {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    student: "",
    currentClass: "",
    newClass: "",
    session: "",
    status: "pending",
  });

  const filtered = promotions.filter((p) =>
    p.student.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Current Class", accessor: "currentClass" },
    { header: "New Class", accessor: "newClass" },
    { header: "Session", accessor: "session" },
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
      setPromotions(
        promotions.map((p) => (p.id === selected.id ? { ...p, ...form } : p)),
      );
    } else {
      setPromotions([...promotions, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({
      student: "",
      currentClass: "",
      newClass: "",
      session: "",
      status: "pending",
    });
  };

  const handleDelete = () => {
    setPromotions(promotions.filter((p) => p.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Student Promotion"
        subtitle="Manage student class promotions"
        actions={
          <ActionButton
            label="New Promotion"
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
          placeholder="Search promotions..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No promotions"
          description="Start promoting students to the next class."
          actionLabel="New Promotion"
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
        title={selected ? "Edit Promotion" : "New Promotion"}
        onSubmit={handleSave}
      >
        <Input
          label="Student Name"
          name="student"
          value={form.student}
          onChange={(e) => setForm({ ...form, student: e.target.value })}
          required
        />
        <Input
          label="Current Class"
          name="currentClass"
          value={form.currentClass}
          onChange={(e) => setForm({ ...form, currentClass: e.target.value })}
          required
        />
        <Input
          label="New Class"
          name="newClass"
          value={form.newClass}
          onChange={(e) => setForm({ ...form, newClass: e.target.value })}
          required
        />
        <Input
          label="Session"
          name="session"
          value={form.session}
          onChange={(e) => setForm({ ...form, session: e.target.value })}
          required
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
          ]}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Promotion"
        message="Are you sure you want to delete this promotion record?"
      />
    </div>
  );
}
