import { useState } from "react";
import { FaCalendarCheck, FaPlus, FaSearch } from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/tables/DataTable";
import ActionButton from "../../components/buttons/ActionButton";
import SearchInput from "../../components/common/SearchInput";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import FormModal from "../../components/modals/FormModal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const initialAttendance = [
  {
    id: 1,
    student: "John Doe",
    class: "JSS 1",
    date: "2026-07-12",
    status: "present",
  },
  {
    id: 2,
    student: "Jane Smith",
    class: "JSS 2",
    date: "2026-07-12",
    status: "absent",
  },
  {
    id: 3,
    student: "Bob Johnson",
    class: "SSS 1",
    date: "2026-07-12",
    status: "present",
  },
];

export default function AttendanceOverviewPage() {
  const [records, setRecords] = useState(initialAttendance);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    student: "",
    class: "",
    date: "",
    status: "present",
  });

  const filtered = records.filter((r) =>
    r.student.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const handleSave = () => {
    setRecords([...records, { id: Date.now(), ...form }]);
    setFormOpen(false);
    setForm({ student: "", class: "", date: "", status: "present" });
  };

  return (
    <div>
      <PageHeader
        title="Attendance Overview"
        subtitle="Track student attendance records"
        actions={
          <ActionButton
            label="Mark Attendance"
            icon={FaPlus}
            onClick={() => setFormOpen(true)}
          />
        }
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search attendance..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No attendance records"
          description="Start marking attendance for students."
          actionLabel="Mark Attendance"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Mark Attendance"
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
            { value: "present", label: "Present" },
            { value: "absent", label: "Absent" },
          ]}
          required
        />
      </FormModal>
    </div>
  );
}
