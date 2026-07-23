import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import enrollmentService from "../../services/enrollmentService";
import studentService from "../../services/studentService";
import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/common/StatusBadge";

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Transferred", label: "Transferred" },
  { value: "Graduated", label: "Graduated" },
  { value: "Withdrawn", label: "Withdrawn" },
  { value: "Suspended", label: "Suspended" },
];

const emptyForm = {
  student: "",
  schoolClass: "",
  status: "Active",
  rollNumber: "",
};

export default function EnrollmentPage() {
  const { data, loading, error, refetch } = useApi(enrollmentService.list);
  const studentsApi = useApi(studentService.list);
  const classesApi = useApi(classService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
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
      roll: enrollment.rollNumber ?? "—",
      __doc: enrollment,
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
    { header: "Roll No.", accessor: "roll" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            onClick={() => openEdit(row.__doc)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            onClick={() => {
              setSelected(row.__doc);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (enrollment) => {
    setSelected(enrollment);
    setForm({
      student: enrollment.student?._id || enrollment.student || "",
      schoolClass: enrollment.schoolClass?._id || enrollment.schoolClass || "",
      status: enrollment.status || "Active",
      rollNumber: enrollment.rollNumber ?? "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await enrollmentService.update(selected._id, {
          schoolClass: form.schoolClass,
          status: form.status,
          rollNumber:
            form.rollNumber === "" ? undefined : Number(form.rollNumber),
        });
        toast.success("Enrollment updated");
      } else {
        await enrollmentService.create({
          student: form.student,
          schoolClass: form.schoolClass,
        });
        toast.success("Student enrolled successfully");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await enrollmentService.remove(selected._id);
      toast.success("Enrollment deleted");
      setDeleteOpen(false);
      setSelected(null);
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
        onAdd={openCreate}
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
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Enrollment" : "Enroll Student"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        {!selected ? (
          <>
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
              The student is enrolled into the current academic session and
              term resolved by the server.
            </p>
          </>
        ) : (
          <>
            <Select
              label="Class"
              name="schoolClass"
              value={form.schoolClass}
              onChange={set("schoolClass")}
              options={classOptions}
              placeholder="Select class"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Status"
                name="status"
                value={form.status}
                onChange={set("status")}
                options={statusOptions}
                required
              />
              <Input
                label="Roll Number"
                name="rollNumber"
                type="number"
                value={form.rollNumber}
                onChange={set("rollNumber")}
                placeholder="Optional"
              />
            </div>
          </>
        )}
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Enrollment"
        message={`Delete ${displayName(selected?.student?.user) || "this student"}'s enrollment in ${classLabel(selected?.schoolClass)} (${selected?.session?.name || "session"})? This cannot be undone.`}
      />
    </>
  );
}
