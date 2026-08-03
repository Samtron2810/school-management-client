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

const emptyBulkForm = { students: [], schoolClass: "" };

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

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState(emptyBulkForm);
  const [bulkSaving, setBulkSaving] = useState(false);

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

  const toggleBulkStudent = (studentId) => {
    setBulkForm((prev) => {
      const exists = prev.students.includes(studentId);
      return {
        ...prev,
        students: exists
          ? prev.students.filter((id) => id !== studentId)
          : [...prev.students, studentId],
      };
    });
  };

  const openBulk = () => {
    setBulkForm(emptyBulkForm);
    setBulkOpen(true);
  };

  const handleBulkSubmit = async () => {
    if (!bulkForm.schoolClass || bulkForm.students.length === 0) {
      toast.error("Select a class and at least one student.");
      return;
    }
    setBulkSaving(true);
    try {
      const result = await enrollmentService.bulkCreate({
        students: bulkForm.students,
        schoolClass: bulkForm.schoolClass,
      });
      toast.success(`${result?.length ?? bulkForm.students.length} student(s) enrolled`);
      setBulkOpen(false);
      setBulkForm(emptyBulkForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast; batch fully rolled back on any failure
    } finally {
      setBulkSaving(false);
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
        toolbar={
          <Button variant="secondary" onClick={openBulk}>
            Bulk Enroll
          </Button>
        }
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

      <FormModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Enroll Students"
        onSubmit={handleBulkSubmit}
        loading={bulkSaving}
        submitLabel={`Enroll ${bulkForm.students.length || ""} Student${bulkForm.students.length === 1 ? "" : "s"}`}
      >
        <Select
          label="Class"
          name="bulkSchoolClass"
          value={bulkForm.schoolClass}
          onChange={(e) =>
            setBulkForm((prev) => ({ ...prev, schoolClass: e.target.value }))
          }
          options={classOptions}
          placeholder="Select class"
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-primary">
            Students <span className="text-danger">*</span>
          </label>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {studentOptions.length === 0 ? (
              <p className="p-3 text-sm text-slate-gray">No students found.</p>
            ) : (
              studentOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={bulkForm.students.includes(option.value)}
                    onChange={() => toggleBulkStudent(option.value)}
                    className="w-4 h-4 accent-coral"
                  />
                  {option.label}
                </label>
              ))
            )}
          </div>
        </div>
        <p className="text-xs text-slate-gray">
          Enrolls into the current session and term. If any selected student
          can't be enrolled (already enrolled, etc.), the whole batch is
          rolled back and nothing is saved.
        </p>
      </FormModal>
    </>
  );
}
