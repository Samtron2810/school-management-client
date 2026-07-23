import { useState } from "react";
import toast from "react-hot-toast";

import enrollmentService from "../../services/enrollmentService";
import studentService from "../../services/studentService";
import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/common/StatusBadge";

const emptyForm = { student: "", schoolClass: "" };

export default function EnrollmentPage() {
  const { data, loading, error, refetch } = useApi(enrollmentService.list);
  const studentsApi = useApi(studentService.list);
  const classesApi = useApi(classService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((enrollment) => {
    const student = enrollment.student;
    const name = displayName(student?.user || student) || "—";
    const cls = classLabel(enrollment.schoolClass);
    const sessionName = enrollment.session?.name || "—";
    const termName = enrollment.term?.name || "—";
    return {
      _id: enrollment._id,
      student: name,
      admissionNumber: student?.admissionNumber || "—",
      class: cls,
      session: sessionName,
      term: termName,
      status: String(enrollment.status || "active").toLowerCase(),
      __search: `${name} ${student?.admissionNumber} ${cls} ${sessionName} ${termName}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const studentOptions = asArray(studentsApi.data).map((student) => ({
    value: student._id,
    label: displayName(student.user || student),
  }));
  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Admission No.", accessor: "admissionNumber" },
    { header: "Class", accessor: "class" },
    { header: "Session", accessor: "session" },
    { header: "Term", accessor: "term" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await enrollmentService.create(form);
      toast.success("Student enrolled successfully");
      setFormOpen(false);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Enrollments"
        subtitle="Enroll students into classes for the current session and term"
        actionLabel="Enroll Student"
        onAdd={() => setFormOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search enrollments..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No enrollments found"
        emptyDescription="Enroll a student into a class to get started."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Enroll Student"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Select
          label="Student"
          name="student"
          value={form.student}
          onChange={set("student")}
          options={studentOptions}
          placeholder="Select student"
          required
        />
        <Select
          label="Class"
          name="schoolClass"
          value={form.schoolClass}
          onChange={set("schoolClass")}
          options={classOptions}
          placeholder="Select class"
          required
        />
        <p className="text-xs text-slate-gray">
          The student is enrolled into the current academic session and term
          resolved by the server.
        </p>
      </FormModal>
    </>
  );
}
