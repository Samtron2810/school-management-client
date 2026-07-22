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
import Button from "../../components/ui/Button";

const initialTeachers = [
  {
    id: 1,
    name: "Mr. James Wilson",
    email: "james@example.com",
    subject: "Mathematics",
    status: "active",
  },
  {
    id: 2,
    name: "Mrs. Sarah Brown",
    email: "sarah@example.com",
    subject: "English",
    status: "active",
  },
  {
    id: 3,
    name: "Mr. David Lee",
    email: "david@example.com",
    subject: "Physics",
    status: "inactive",
  },
];

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "" });

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Subject", accessor: "subject" },
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
              setSelectedTeacher(row);
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            onClick={() => {
              setSelectedTeacher(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleSave = () => {
    if (selectedTeacher) {
      setTeachers(
        teachers.map((t) =>
          t.id === selectedTeacher.id ? { ...t, ...form } : t,
        ),
      );
    } else {
      setTeachers([...teachers, { id: Date.now(), ...form, status: "active" }]);
    }
    setFormOpen(false);
    setSelectedTeacher(null);
    setForm({ name: "", email: "", subject: "" });
  };

  const handleDelete = () => {
    setTeachers(teachers.filter((t) => t.id !== selectedTeacher.id));
    setDeleteOpen(false);
    setSelectedTeacher(null);
  };

  return (
    <div>
      <PageHeader
        title="Teacher Management"
        subtitle="Manage all teachers"
        actions={
          <ActionButton
            label="Add Teacher"
            icon={FaPlus}
            onClick={() => {
              setSelectedTeacher(null);
              setFormOpen(true);
            }}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search teachers..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No teachers found"
          description="Get started by adding a new teacher."
          actionLabel="Add Teacher"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedTeacher(null);
        }}
        title={selectedTeacher ? "Edit Teacher" : "Add Teacher"}
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
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher? This action cannot be undone."
      />
    </div>
  );
}
