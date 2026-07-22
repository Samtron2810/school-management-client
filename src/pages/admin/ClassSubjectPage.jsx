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
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const initialAssignments = [
  {
    id: 1,
    class: "JSS 1",
    subject: "Mathematics",
    teacher: "Mr. James Wilson",
    status: "active",
  },
  {
    id: 2,
    class: "JSS 2",
    subject: "English",
    teacher: "Mrs. Sarah Brown",
    status: "active",
  },
  {
    id: 3,
    class: "SSS 1",
    subject: "Physics",
    teacher: "Mr. David Lee",
    status: "inactive",
  },
];

export default function ClassSubjectPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    class: "",
    subject: "",
    teacher: "",
    status: "active",
  });

  const filtered = assignments.filter((a) =>
    a.class.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Teacher", accessor: "teacher" },
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
              setForm({
                class: row.class || "",
                subject: row.subject || "",
                teacher: row.teacher || "",
                status: row.status || "active",
              });
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
    setForm({ class: "", subject: "", teacher: "", status: "active" });
  };

  const handleDelete = () => {
    setAssignments(assignments.filter((a) => a.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Class Subjects"
        subtitle="Assign subjects to classes"
        actions={
          <ActionButton
            label="Assign Subject"
            icon={FaPlus}
            onClick={() => {
              setSelected(null);
              setForm({ class: "", subject: "", teacher: "", status: "active" });
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
          description="Assign subjects to classes."
          actionLabel="Assign Subject"
          onAction={() => {
            setSelected(null);
            setForm({ class: "", subject: "", teacher: "", status: "active" });
            setFormOpen(true);
          }}
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
        title={selected ? "Edit Assignment" : "Assign Subject"}
        onSubmit={handleSave}
      >
        <Input
          label="Class"
          name="class"
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
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
          label="Teacher"
          name="teacher"
          value={form.teacher}
          onChange={(e) => setForm({ ...form, teacher: e.target.value })}
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
