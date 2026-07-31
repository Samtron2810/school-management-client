import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt, FaPaperclip, FaEye } from "react-icons/fa";

import lessonService from "../../services/lessonService";
import useMyTeaching from "../../hooks/useMyTeaching";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatusBadge from "../../components/common/StatusBadge";
import FileInput from "../../components/forms/FileInput";

const emptyForm = {
  teacherAssignment: "",
  title: "",
  topic: "",
  description: "",
  week: "",
};

export default function LessonPlanPage() {
  const { lessons, assignments, loading, error, refetch } = useMyTeaching();
  const [search, setSearch] = useState("");
  const [classSubjectFilter, setClassSubjectFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const rows = lessons.map((lesson) => {
    const classSubjectId = lesson.teacherAssignment?._id || lesson.teacherAssignment || "";
    return {
      _id: lesson._id,
      title: lesson.title || "—",
      topic: lesson.topic || "—",
      class: lesson.teacherAssignment?.schoolClass
        ? `${lesson.teacherAssignment.schoolClass.className || ""} ${lesson.teacherAssignment.schoolClass.arm || ""}`.trim()
        : "—",
      subject: lesson.teacherAssignment?.subject?.name || "—",
      week: lesson.week || "—",
      status: lesson.isPublished ? "published" : "draft",
      date: formatDate(lesson.createdAt),
      attachments: lesson.attachments?.length || 0,
      classSubjectId,
      __doc: lesson,
      __search: `${lesson.title} ${lesson.topic} ${lesson.teacherAssignment?.subject?.name}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => {
    const matchesSearch = row.__search.includes(search.toLowerCase());
    const matchesClassSubject = !classSubjectFilter || String(row.classSubjectId) === String(classSubjectFilter);
    return matchesSearch && matchesClassSubject;
  });

  const assignmentOptions = assignments.map((assignment) => ({
    value: assignment.id,
    label: assignment.label,
  }));

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Lesson lists don't embed attachments — fetch the full detail for viewing.
  const openView = async (row) => {
    try {
      const detail = await lessonService.get(row._id);
      setSelected(detail);
    } catch {
      setSelected(row.__doc);
    }
    setViewOpen(true);
  };

  const openEdit = (row) => {
    const lesson = row.__doc;
    setSelected(lesson);
    setForm({
      teacherAssignment: lesson.teacherAssignment?._id || lesson.teacherAssignment || "",
      title: lesson.title || "",
      topic: lesson.topic || "",
      description: lesson.description || "",
      week: lesson.week ?? "",
    });
    setFiles([]);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const fields = {
        ...form,
        week: form.week === "" ? undefined : Number(form.week),
        isPublished: true,
      };
      if (selected) {
        await lessonService.update(selected._id, fields, files);
        toast.success("Lesson updated");
      } else {
        await lessonService.create(fields, files);
        toast.success("Lesson created");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      setFiles([]);
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
      await lessonService.remove(selected._id);
      toast.success("Lesson deleted");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Topic", accessor: "topic" },
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Week", accessor: "week" },
    {
      header: "Files",
      accessor: "attachments",
      render: (row) => (row.attachments > 0 ? <Badge variant="info"><FaPaperclip className="mr-1" />{row.attachments}</Badge> : "—"),
    },
    { header: "Created", accessor: "date" },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEye}
            onClick={() => openView(row)}
          />
          <Button variant="ghost" size="sm" icon={FaEdit} onClick={() => openEdit(row)} />
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

  return (
    <>
      <ManagePage
        title="Lesson Plans"
        subtitle="Create and manage lessons for your class subjects"
        actionLabel="New Lesson"
        onAdd={() => {
          setSelected(null);
          setForm(emptyForm);
          setFiles([]);
          setFormOpen(true);
        }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search lessons..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No lessons yet"
        emptyDescription="Create your first lesson for one of your assigned class subjects."
        toolbar={
          <div className="w-64">
            <Select
              name="class-subject-filter"
              value={classSubjectFilter}
              onChange={(e) => setClassSubjectFilter(e.target.value)}
              options={[
                { value: "", label: "All Class Subjects" },
                ...assignmentOptions,
              ]}
              placeholder="Filter by Class-Subject"
            />
          </div>
        }
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Lesson" : "New Lesson"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Select
          label="Class Subject"
          name="teacherAssignment"
          value={form.teacherAssignment}
          onChange={set("teacherAssignment")}
          options={assignmentOptions}
          placeholder={assignmentOptions.length ? "Select class subject" : "Create a lesson first via an admin assignment"}
          required
        />
        <Input label="Title" name="title" value={form.title} onChange={set("title")} required />
        <Input label="Topic" name="topic" value={form.topic} onChange={set("topic")} required />
        <Textarea label="Description" name="description" value={form.description} onChange={set("description")} rows={3} />
        <Input label="Week" name="week" type="number" value={form.week} onChange={set("week")} placeholder="e.g. 3" />
        <FileInput label="Attachments (up to 10)" name="files" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 10))} />
        {files.length > 0 && (
          <p className="text-xs text-slate-gray">{files.length} file(s) selected</p>
        )}
      </FormModal>

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected?.title || "Lesson"} maxWidth="lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <Badge variant="info">{selected.teacherAssignment?.subject?.name || "Subject"}</Badge>
              <StatusBadge status={selected.isPublished ? "published" : "draft"} />
            </div>
            <p className="font-medium text-primary">{selected.topic}</p>
            <p className="text-slate-gray whitespace-pre-line">{selected.description || "No description."}</p>
            {Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-gray mb-1">Attachments</p>
                <ul className="space-y-1">
                  {selected.attachments.map((file) => (
                    <li key={file._id}>
                      <a
                        href={file.url || file.secure_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-royal-blue hover:underline text-sm"
                      >
                        {file.originalName || file.fileName || "Download attachment"}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lesson"
        message={`Delete "${selected?.title}"? Students will no longer see it.`}
      />
    </>
  );
}
