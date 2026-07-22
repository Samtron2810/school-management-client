import { useState } from "react";
import {
  FaUserCheck,
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

const initialEnrollments = [
  {
    id: 1,
    student: "John Doe",
    class: "JSS 1",
    date: "2026-01-10",
    status: "active",
  },
  {
    id: 2,
    student: "Jane Smith",
    class: "JSS 2",
    date: "2026-01-12",
    status: "active",
  },
  {
    id: 3,
    student: "Bob Johnson",
    class: "SSS 1",
    date: "2026-01-15",
    status: "pending",
  },
];

export default function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    student: "",
    class: "",
    date: "",
    status: "active",
  });

  const filtered = enrollments.filter((e) =>
    e.student.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Class", accessor: "class" },
    { header: "Enrollment Date", accessor: "date" },
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
      setEnrollments(
        enrollments.map((e) => (e.id === selected.id ? { ...e, ...form } : e)),
      );
    } else {
      setEnrollments([...enrollments, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({ student: "", class: "", date: "", status: "active" });
  };

  const handleDelete = () => {
    setEnrollments(enrollments.filter((e) => e.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Enrollment"
        subtitle="Manage student enrollments"
        actions={
          <ActionButton
            label="New Enrollment"
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
          placeholder="Search enrollments..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No enrollments"
          description="Start enrolling students into classes."
          actionLabel="New Enrollment"
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
        title={selected ? "Edit Enrollment" : "New Enrollment"}
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
          label="Class"
          name="class"
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
          required
        />
        <Input
          label="Enrollment Date"
          name="date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[
            { value: "active", label: "Active" },
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
        title="Delete Enrollment"
        message="Are you sure you want to delete this enrollment?"
      />
    </div>
  );
}
