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
import Button from "../../components/ui/Button";

const initialStudents = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    class: "JSS 1",
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    class: "JSS 2",
    status: "active",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    class: "SSS 1",
    status: "inactive",
  },
];

export default function StudentManagementPage() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", class: "" });

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Class", accessor: "class" },
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
              setSelectedStudent(row);
              setForm({
                name: row.name || "",
                email: row.email || "",
                class: row.class || "",
              });
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            onClick={() => {
              setSelectedStudent(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleSave = () => {
    if (selectedStudent) {
      setStudents(
        students.map((s) =>
          s.id === selectedStudent.id ? { ...s, ...form } : s,
        ),
      );
    } else {
      setStudents([...students, { id: Date.now(), ...form, status: "active" }]);
    }
    setFormOpen(false);
    setSelectedStudent(null);
    setForm({ name: "", email: "", class: "" });
  };

  const handleDelete = () => {
    setStudents(students.filter((s) => s.id !== selectedStudent.id));
    setDeleteOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="Manage all students in the school"
        actions={
          <ActionButton
            label="Add Student"
            icon={FaPlus}
            onClick={() => {
              setSelectedStudent(null);
              setForm({ name: "", email: "", class: "" });
              setFormOpen(true);
            }}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search students..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Get started by adding a new student."
          actionLabel="Add Student"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent ? "Edit Student" : "Add Student"}
        onSubmit={handleSave}
      >
        <Input
          label="Full Name"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Class"
          name="class"
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
      />
    </div>
  );
}
