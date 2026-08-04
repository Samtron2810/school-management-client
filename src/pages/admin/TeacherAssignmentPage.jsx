import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import teacherAssignmentService from "../../services/teacherAssignmentService";
import teacherService from "../../services/teacherService";
import classService from "../../services/classService";
import subjectService from "../../services/subjectService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const emptyForm = { teacher: "", schoolClass: "", subject: "" };

export default function TeacherAssignmentPage() {
  const { data, loading, error, refetch } = useApi(
    teacherAssignmentService.list,
  );
  const teachersApi = useApi(teacherService.list);
  const classesApi = useApi(classService.list);
  const subjectsApi = useApi(subjectService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((assignment) => {
    const rawTeacher = assignment.teacher?.user || assignment.teacher;
    const teacherName =
      typeof rawTeacher === "string" ? "—" : displayName(rawTeacher) || "—";
    const cls = classLabel(assignment.schoolClass);
    const subj = assignment.subject?.name || "—";
    return {
      _id: assignment._id,
      teacher: teacherName,
      class: cls,
      subject: subj,
      code: assignment.subject?.code || "—",
      status: assignment.isActive === false ? "inactive" : "active",
      __doc: assignment,
      __search: `${teacherName} ${cls} ${subj}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

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
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`text-xs font-medium ${
            row.status === "active" ? "text-green-600" : "text-slate-gray"
          }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            title="Edit assignment"
            onClick={() => openEdit(row.__doc)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            title="Remove assignment"
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

  const openEdit = (assignment) => {
    setSelected(assignment);
    setForm({
      teacher: assignment.teacher?._id || assignment.teacher || "",
      schoolClass: assignment.schoolClass?._id || assignment.schoolClass || "",
      subject: assignment.subject?._id || assignment.subject || "",
      isActive: assignment.isActive !== false,
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await teacherAssignmentService.update(selected._id, {
          teacher: form.teacher,
          schoolClass: form.schoolClass,
          subject: form.subject,
          isActive: form.isActive,
        });
        toast.success("Assignment updated");
      } else {
        await teacherAssignmentService.create({
          teacher: form.teacher,
          schoolClass: form.schoolClass,
          subject: form.subject,
        });
        toast.success("Teacher assigned successfully");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast (e.g. slot already taken)
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await teacherAssignmentService.remove(selected._id);
      toast.success("Assignment removed");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // server blocks removing an assignment referenced by assessments/attendance
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
        onAdd={openCreate}
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
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Assignment" : "Assign Teacher"}
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
        {selected && (
          <div className="flex items-center gap-3">
            <input
              id="assignment-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-4 h-4 accent-coral"
            />
            <label htmlFor="assignment-active" className="text-sm text-primary">
              Assignment is active
            </label>
          </div>
        )}
        {selected && (
          <p className="text-xs text-slate-gray">
            Swapping the teacher, class, or subject fails if that slot is
            already assigned to someone else this term.
          </p>
        )}
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Assignment"
        message={`Remove ${selected?.teacher?.user ? `${selected.teacher.user.firstName || ""} ${selected.teacher.user.lastName || ""}`.trim() : "this teacher"}'s assignment to ${selected?.subject?.name || "subject"} (${selected?.schoolClass?.className || ""} ${selected?.schoolClass?.arm || ""})? The server will refuse while assessments or attendance reference it.`}
      />
    </>
  );
}
