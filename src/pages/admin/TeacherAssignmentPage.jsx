import { useState } from "react";
import {
  FaChalkboardTeacher,
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

const initialAssignments = [
  {
    id: 1,
    teacher: "Mr. James Wilson",
    subject: "Mathematics",
    class: "JSS 1",
    session: "2025/2026",
    status: "active",
  },
  {
    id: 2,
    teacher: "Mrs. Sarah Brown",
    subject: "English",
    class: "JSS 2",
    session: "2025/2026",
    status: "active",
  },
  {
    id: 3,
    teacher: "Mr. David Lee",
    subject: "Physics",
    class: "SSS 1",
    session: "2025/2026",
    status: "inactive",
  },
];

export default function TeacherAssignmentPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    teacher: "",
    subject: "",
    class: "",
    session: "",
    status: "active",
  });

  const filtered = assignments.filter((a) =>
    a.teacher.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Teacher", accessor: "teacher" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
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
      setAssignments(
        assignments.map((a) => (a.id === selected.id ? { ...a, ...form } : a)),
      );
    } else {
      setAssignments([...assignments, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({
      teacher: "",
      subject: "",
      class: "",
      session: "",
      status: "active",
    });
  };

  const handleDelete = () => {
    setAssignments(assignments.filter((a) => a.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Teacher Assignment"
        subtitle="Assign teachers to subjects and classes"
        actions={
          <ActionButton
            label="New Assignment"
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
          placeholder="Search assignments..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No assignments"
          description="Assign teachers to subjects and classes."
          actionLabel="New Assignment"
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
        title={selected ? "Edit Assignment" : "New Assignment"}
        onSubmit={handleSave}
      >
        <Input
          label="Teacher"
          name="teacher"
          value={form.teacher}
          onChange={(e) => setForm({ ...form, teacher: e.target.value })}
          required
        />
        <Input
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
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
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment?"
      />
    </div>
  );
}
