import { useState } from "react";
import toast from "react-hot-toast";

import classSubjectService from "../../services/classSubjectService";
import classService from "../../services/classService";
import subjectService from "../../services/subjectService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Select from "../../components/ui/Select";

const emptyForm = { schoolClass: "", subject: "" };

export default function ClassSubjectPage() {
  const { data, loading, error, refetch } = useApi(classSubjectService.list);
  const classesApi = useApi(classService.list);
  const subjectsApi = useApi(subjectService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
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
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await classSubjectService.create(form);
      toast.success("Subject linked to class");
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
        title="Class Subjects"
        subtitle="Subjects assigned to each class"
        actionLabel="Link Class Subject"
        onAdd={() => setFormOpen(true)}
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
        onClose={() => setFormOpen(false)}
        title="Link Class Subject"
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
      </FormModal>
    </>
  );
}
