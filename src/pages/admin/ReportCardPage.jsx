import { useState } from "react";
import {
  FaFileAlt,
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

const initialReports = [
  {
    id: 1,
    student: "John Doe",
    class: "JSS 1",
    term: "First Term",
    session: "2025/2026",
    grade: "A",
    status: "published",
  },
  {
    id: 2,
    student: "Jane Smith",
    class: "JSS 2",
    term: "First Term",
    session: "2025/2026",
    grade: "B+",
    status: "draft",
  },
  {
    id: 3,
    student: "Bob Johnson",
    class: "SSS 1",
    term: "First Term",
    session: "2025/2026",
    grade: "A-",
    status: "published",
  },
];

export default function ReportCardPage() {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    student: "",
    class: "",
    term: "",
    session: "",
    grade: "",
    status: "draft",
  });

  const filtered = reports.filter((r) =>
    r.student.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Class", accessor: "class" },
    { header: "Term", accessor: "term" },
    { header: "Session", accessor: "session" },
    { header: "Grade", accessor: "grade" },
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
      setReports(
        reports.map((r) => (r.id === selected.id ? { ...r, ...form } : r)),
      );
    } else {
      setReports([...reports, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({
      student: "",
      class: "",
      term: "",
      session: "",
      grade: "",
      status: "draft",
    });
  };

  const handleDelete = () => {
    setReports(reports.filter((r) => r.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Report Card"
        subtitle="Manage student report cards and grades"
        actions={
          <ActionButton
            label="Generate Report"
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
          placeholder="Search report cards..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No report cards"
          description="Generate report cards for students."
          actionLabel="Generate Report"
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
        title={selected ? "Edit Report Card" : "Generate Report Card"}
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
        <Select
          label="Term"
          name="term"
          value={form.term}
          onChange={(e) => setForm({ ...form, term: e.target.value })}
          options={[
            { value: "First Term", label: "First Term" },
            { value: "Second Term", label: "Second Term" },
            { value: "Third Term", label: "Third Term" },
          ]}
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
          label="Grade"
          name="grade"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          required
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Report Card"
        message="Are you sure you want to delete this report card?"
      />
    </div>
  );
}
