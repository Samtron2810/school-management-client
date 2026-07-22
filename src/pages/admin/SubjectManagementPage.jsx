import { useState } from "react";
import {
  FaBook,
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

const initialSubjects = [
  {
    id: 1,
    name: "Mathematics",
    code: "MTH101",
    teacher: "Mr. James Wilson",
    credits: 4,
    status: "active",
  },
  {
    id: 2,
    name: "English",
    code: "ENG101",
    teacher: "Mrs. Sarah Brown",
    credits: 3,
    status: "active",
  },
  {
    id: 3,
    name: "Physics",
    code: "PHY101",
    teacher: "Mr. David Lee",
    credits: 4,
    status: "inactive",
  },
];

export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    teacher: "",
    credits: "",
  });

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Subject", accessor: "name" },
    { header: "Code", accessor: "code" },
    { header: "Teacher", accessor: "teacher" },
    { header: "Credits", accessor: "credits" },
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
              setSelectedSubject(row);
              setForm({
                name: row.name || "",
                code: row.code || "",
                teacher: row.teacher || "",
                credits: row.credits || "",
              });
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            onClick={() => {
              setSelectedSubject(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleSave = () => {
    if (selectedSubject) {
      setSubjects(
        subjects.map((s) =>
          s.id === selectedSubject.id ? { ...s, ...form } : s,
        ),
      );
    } else {
      setSubjects([...subjects, { id: Date.now(), ...form, status: "active" }]);
    }
    setFormOpen(false);
    setSelectedSubject(null);
    setForm({ name: "", code: "", teacher: "", credits: "" });
  };

  const handleDelete = () => {
    setSubjects(subjects.filter((s) => s.id !== selectedSubject.id));
    setDeleteOpen(false);
    setSelectedSubject(null);
  };

  return (
    <div>
      <PageHeader
        title="Subject Management"
        subtitle="Manage subjects and curriculum"
        actions={
          <ActionButton
            label="Add Subject"
            icon={FaPlus}
            onClick={() => {
              setSelectedSubject(null);
              setForm({ name: "", code: "", teacher: "", credits: "" });
              setFormOpen(true);
            }}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search subjects..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No subjects found"
          description="Get started by adding a new subject."
          actionLabel="Add Subject"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedSubject(null);
        }}
        title={selectedSubject ? "Edit Subject" : "Add Subject"}
        onSubmit={handleSave}
      >
        <Input
          label="Subject Name"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Subject Code"
          name="code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <Input
          label="Teacher"
          name="teacher"
          value={form.teacher}
          onChange={(e) => setForm({ ...form, teacher: e.target.value })}
          required
        />
        <Input
          label="Credits"
          name="credits"
          type="number"
          value={form.credits}
          onChange={(e) => setForm({ ...form, credits: e.target.value })}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This action cannot be undone."
      />
    </div>
  );
}
