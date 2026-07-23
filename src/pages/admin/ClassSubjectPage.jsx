import { useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import classSubjectService from "../../services/classSubjectService";
import classService from "../../services/classService";
import subjectService from "../../services/subjectService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";

const emptyForm = { schoolClass: "", subject: "", isCompulsory: true };

export default function ClassSubjectPage() {
  const { data, loading, error, refetch } = useApi(classSubjectService.list);
  const classesApi = useApi(classService.list);
  const subjectsApi = useApi(subjectService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((link) => {
    const schoolClass = link.schoolClass;
    const subject = link.subject;
    const cls = classLabel(schoolClass);
    const subj = subject?.name || "—";
    return {
      _id: link._id,
      class: cls,
      subject: subj,
      code: subject?.code || "—",
      compulsory: link.isCompulsory === false ? "Elective" : "Compulsory",
      __doc: link,
      __search: `${cls} ${subj} ${subject?.code}`.toLowerCase(),
    };
  });

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));
  const subjectOptions = asArray(subjectsApi.data).map((subject) => ({
    value: subject._id,
    label: subject.name,
  }));

  const columns = [
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Subject Code", accessor: "code" },
    { header: "Type", accessor: "compulsory" },
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

  const openEdit = (link) => {
    setSelected(link);
    setForm({
      schoolClass: link.schoolClass?._id || link.schoolClass || "",
      subject: link.subject?._id || link.subject || "",
      isCompulsory: link.isCompulsory !== false,
      isActive: link.isActive !== false,
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (selected) {
        await classSubjectService.update(selected._id, {
          schoolClass: form.schoolClass,
          subject: form.subject,
          isCompulsory: form.isCompulsory,
          isActive: form.isActive,
        });
        toast.success("Class subject updated");
      } else {
        await classSubjectService.create({
          schoolClass: form.schoolClass,
          subject: form.subject,
          isCompulsory: form.isCompulsory,
        });
        toast.success("Subject linked to class");
      }
      setFormOpen(false);
      setSelected(null);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast (e.g. pair already linked)
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await classSubjectService.remove(selected._id);
      toast.success("Class subject removed");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // server blocks removing a link referenced by lessons/assessments
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Class Subjects"
        subtitle="Subjects assigned to each class"
        actionLabel="Link Class Subject"
        onAdd={openCreate}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search class subjects..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No class subjects found"
        emptyDescription="Link a subject to a class to get started."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Class Subject" : "Link Class Subject"}
        onSubmit={handleSubmit}
        loading={saving}
      >
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
        <Toggle
          label="Compulsory subject"
          enabled={form.isCompulsory}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, isCompulsory: value }))
          }
        />
        {selected && (
          <Toggle
            label="Active"
            enabled={form.isActive}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, isActive: value }))
            }
          />
        )}
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Class Subject"
        message={`Remove ${selected?.subject?.name || "this subject"} from ${classLabel(selected?.schoolClass)}? The server will refuse while lessons or assessments reference the link.`}
      />
    </>
  );
}
