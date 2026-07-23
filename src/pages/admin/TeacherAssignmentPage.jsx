import { useState } from "react";
import toast from "react-hot-toast";

import teacherAssignmentService from "../../services/teacherAssignmentService";
import teacherService from "../../services/teacherService";
import classService from "../../services/classService";
import subjectService from "../../services/subjectService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Select from "../../components/ui/Select";

const emptyForm = { teacher: "", schoolClass: "", subject: "" };

export default function TeacherAssignmentPage() {
  const { data, loading, error, refetch } = useApi(teacherAssignmentService.list);
  const teachersApi = useApi(teacherService.list);
  const classesApi = useApi(classService.list);
  const subjectsApi = useApi(subjectService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((assignment) => {
    const teacherName = displayName(assignment.teacher?.user || assignment.teacher) || "—";
    const cls = classLabel(assignment.schoolClass);
    const subj = assignment.subject?.name || "—";
    return {
      _id: assignment._id,
      teacher: teacherName,
      class: cls,
      subject: subj,
      code: assignment.subject?.code || "—",
      __search: `${teacherName} ${cls} ${subj}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const teacherOptions = asArray(teachersApi.data).map((teacher) => ({
    value: teacher._id,
    label: displayName(teacher.user || teacher),
  }));
  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));
  const subjectOptions = asArray(subjectsApi.data).map((subject) => ({
    value: subject._id,
    label: subject.name,
  }));

  const columns = [
    { header: "Teacher", accessor: "teacher" },
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Code", accessor: "code" },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await teacherAssignmentService.create(form);
      toast.success("Teacher assigned successfully");
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
        title="Teacher Assignments"
        subtitle="Assign teachers to class subjects — the key used by lessons, attendance and assessments"
        actionLabel="Assign Teacher"
        onAdd={() => setFormOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assignments..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No assignments found"
        emptyDescription="Assign a teacher to a class subject to get started."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Assign Teacher"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Select
          label="Teacher"
          name="teacher"
          value={form.teacher}
          onChange={set("teacher")}
          options={teacherOptions}
          placeholder="Select teacher"
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
        <Select
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={set("subject")}
          options={subjectOptions}
          placeholder="Select subject"
          required
        />
      </FormModal>
    </>
  );
}
