import { useState } from "react";
import {
  FaClipboardList,
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

const initialAssessments = [
  {
    id: 1,
    title: "Mid-term Exam",
    subject: "Mathematics",
    class: "JSS 1",
    date: "2026-07-20",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Quiz 1",
    subject: "English",
    class: "JSS 2",
    date: "2026-07-15",
    status: "completed",
  },
  {
    id: 3,
    title: "Assignment",
    subject: "Physics",
    class: "SSS 1",
    date: "2026-07-18",
    status: "pending",
  },
];

export default function AssessmentManagementPage() {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    class: "",
    date: "",
    status: "upcoming",
  });

  const filtered = assessments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date" },
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
      setAssessments(
        assessments.map((a) => (a.id === selected.id ? { ...a, ...form } : a)),
      );
    } else {
      setAssessments([...assessments, { id: Date.now(), ...form }]);
    }
    setFormOpen(false);
    setSelected(null);
    setForm({
      title: "",
      subject: "",
      class: "",
      date: "",
      status: "upcoming",
    });
  };

  const handleDelete = () => {
    setAssessments(assessments.filter((a) => a.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader
        title="Assessment Management"
        subtitle="Manage exams, quizzes and assignments"
        actions={
          <ActionButton
            label="Add Assessment"
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
          placeholder="Search assessments..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No assessments found"
          description="Get started by adding a new assessment."
          actionLabel="Add Assessment"
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
        title={selected ? "Edit Assessment" : "Add Assessment"}
        onSubmit={handleSave}
      >
        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
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
          label="Date"
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
            { value: "upcoming", label: "Upcoming" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
          ]}
          required
        />
      </FormModal>
      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment?"
      />
    </div>
  );
}
