import { useState } from "react";
import {
  FaSchool,
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

const initialClasses = [
  {
    id: 1,
    name: "JSS 1",
    section: "A",
    teacher: "Mr. James Wilson",
    students: 35,
    status: "active",
  },
  {
    id: 2,
    name: "JSS 2",
    section: "B",
    teacher: "Mrs. Sarah Brown",
    students: 32,
    status: "active",
  },
  {
    id: 3,
    name: "SSS 1",
    section: "A",
    teacher: "Mr. David Lee",
    students: 28,
    status: "inactive",
  },
];

export default function ClassManagementPage() {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [form, setForm] = useState({
    name: "",
    section: "",
    teacher: "",
    students: "",
  });

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Section", accessor: "section" },
    { header: "Teacher", accessor: "teacher" },
    { header: "Students", accessor: "students" },
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
              setSelectedClass(row);
              setForm({
                name: row.name || "",
                section: row.section || "",
                teacher: row.teacher || "",
                students: row.students || "",
              });
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            onClick={() => {
              setSelectedClass(row);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const handleSave = () => {
    if (selectedClass) {
      setClasses(
        classes.map((c) => (c.id === selectedClass.id ? { ...c, ...form } : c)),
      );
    } else {
      setClasses([...classes, { id: Date.now(), ...form, status: "active" }]);
    }
    setFormOpen(false);
    setSelectedClass(null);
    setForm({ name: "", section: "", teacher: "", students: "" });
  };

  const handleDelete = () => {
    setClasses(classes.filter((c) => c.id !== selectedClass.id));
    setDeleteOpen(false);
    setSelectedClass(null);
  };

  return (
    <div>
      <PageHeader
        title="Class Management"
        subtitle="Manage school classes and sections"
        actions={
          <ActionButton
            label="Add Class"
            icon={FaPlus}
            onClick={() => {
              setSelectedClass(null);
              setForm({ name: "", section: "", teacher: "", students: "" });
              setFormOpen(true);
            }}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search classes..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No classes found"
          description="Get started by adding a new class."
          actionLabel="Add Class"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedClass(null);
        }}
        title={selectedClass ? "Edit Class" : "Add Class"}
        onSubmit={handleSave}
      >
        <Input
          label="Class Name"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Section"
          name="section"
          value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}
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
          label="Number of Students"
          name="students"
          type="number"
          value={form.students}
          onChange={(e) => setForm({ ...form, students: e.target.value })}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Class"
        message="Are you sure you want to delete this class? This action cannot be undone."
      />
    </div>
  );
}
