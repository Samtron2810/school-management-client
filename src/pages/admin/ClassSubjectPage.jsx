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
const emptyBulkForm = { schoolClass: "", subjects: [], isCompulsory: true };

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

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState(emptyBulkForm);
  const [bulkSaving, setBulkSaving] = useState(false);

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

  const toggleBulkSubject = (subjectId) => {
    setBulkForm((prev) => {
      const exists = prev.subjects.includes(subjectId);
      return {
        ...prev,
        subjects: exists
          ? prev.subjects.filter((id) => id !== subjectId)
          : [...prev.subjects, subjectId],
      };
    });
  };

  const openBulk = () => {
    setBulkForm(emptyBulkForm);
    setBulkOpen(true);
  };

  const handleBulkSubmit = async () => {
    if (!bulkForm.schoolClass || bulkForm.subjects.length === 0) {
      toast.error("Select a class and at least one subject.");
      return;
    }
    setBulkSaving(true);
    try {
      const result = await classSubjectService.bulkCreate({
        schoolClass: bulkForm.schoolClass,
        subjects: bulkForm.subjects,
        isCompulsory: bulkForm.isCompulsory,
      });
      toast.success(`${result?.length ?? bulkForm.subjects.length} subject(s) linked`);
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
        toolbar={
          <Button variant="secondary" onClick={openBulk}>
            Bulk Link Subjects
          </Button>
        }
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

      <FormModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Link Subjects to Class"
        onSubmit={handleBulkSubmit}
        loading={bulkSaving}
        submitLabel={`Link ${bulkForm.subjects.length || ""} Subject${bulkForm.subjects.length === 1 ? "" : "s"}`}
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
            Subjects <span className="text-danger">*</span>
          </label>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {subjectOptions.length === 0 ? (
              <p className="p-3 text-sm text-slate-gray">No subjects found.</p>
            ) : (
              subjectOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={bulkForm.subjects.includes(option.value)}
                    onChange={() => toggleBulkSubject(option.value)}
                    className="w-4 h-4 accent-coral"
                  />
                  {option.label}
                </label>
              ))
            )}
          </div>
        </div>
        <Toggle
          label="Compulsory subjects"
          enabled={bulkForm.isCompulsory}
          onChange={(value) =>
            setBulkForm((prev) => ({ ...prev, isCompulsory: value }))
          }
        />
        <p className="text-xs text-slate-gray">
          If any selected subject can't be linked (already linked, etc.), the
          whole batch is rolled back and nothing is saved.
        </p>
      </FormModal>
    </>
  );
}
