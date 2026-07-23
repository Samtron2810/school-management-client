import { useState } from "react";
import toast from "react-hot-toast";
import { FaBan, FaCheckCircle, FaEye, FaPlus } from "react-icons/fa";

import assessmentService from "../../services/assessmentService";
import questionService from "../../services/questionService";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import useMyTeaching from "../../hooks/useMyTeaching";
import { asArray, classLabel, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import StatusBadge from "../../components/common/StatusBadge";
import CheckboxGroup from "../../components/forms/CheckboxGroup";

const typeOptions = [
  { value: "Quiz", label: "Quiz" },
  { value: "Test", label: "Test" },
  { value: "Assignment", label: "Assignment" },
  { value: "Examination", label: "Examination" },
];

const emptyForm = {
  teacherAssignment: "",
  title: "",
  type: "Quiz",
  instructions: "",
  duration: 30,
  availableFrom: "",
  availableTo: "",
  maxAttempts: 1,
  passingScore: "",
  shuffleQuestions: false,
  shuffleOptions: false,
  showScoreImmediately: true,
  showCorrectAnswers: false,
};

export default function AssessmentPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(assessmentService.list);
  const { assignments } = useMyTeaching();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bank, setBank] = useState([]);
  const [questionIds, setQuestionIds] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const myUserId = user?._id || user?.id;

  const rows = asArray(data)
    .map((assessment) => {
      const teacherUserId = assessment.teacher?.user?._id || assessment.teacher?.user || null;
      const classSubject = assessment.classSubject || {};
      return {
        _id: assessment._id,
        title: assessment.title || "—",
        type: assessment.type || "—",
        class: classLabel(classSubject.schoolClass),
        subject: classSubject.subject?.name || "—",
        teacher: displayName(assessment.teacher?.user || assessment.teacher) || "—",
        window: `${formatDate(assessment.availableFrom)} → ${formatDate(assessment.availableTo)}`,
        status: assessment.isPublished ? "published" : "draft",
        mine: Boolean(myUserId && teacherUserId && String(teacherUserId) === String(myUserId)),
        __doc: assessment,
        __search: `${assessment.title} ${assessment.type} ${classSubject.subject?.name}`.toLowerCase(),
      };
    })
    .filter((row) => row.mine);

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const assignmentOptions = assignments.map((assignment) => ({
    value: assignment.id,
    label: assignment.label,
  }));

  const togglePublish = async (row) => {
    setBusyId(row._id);
    try {
      if (row.status === "published") {
        await assessmentService.unpublish(row._id);
        toast.success("Assessment unpublished");
      } else {
        await assessmentService.publish(row._id);
        toast.success("Assessment published");
      }
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setBusyId(null);
    }
  };

  const openQuestions = async (row) => {
    setSelected(row.__doc);
    setQuestionIds([]);
    try {
      const payload = await questionService.list({ limit: 100 });
      const subjectId = row.__doc.classSubject?.subject?._id || row.__doc.classSubject?.subject;
      setBank(
        asArray(payload).filter((question) => {
          const questionSubject = question.classSubject?.subject?._id || question.classSubject?.subject;
          return !subjectId || String(questionSubject) === String(subjectId);
        }),
      );
    } catch {
      setBank([]);
    }
    setQuestionsOpen(true);
  };

  const submitQuestions = async () => {
    if (questionIds.length === 0) {
      toast.error("Select at least one question");
      return;
    }
    setSaving(true);
    try {
      await assessmentService.addQuestions(selected._id, { questionIds });
      toast.success("Questions added to assessment");
      setQuestionsOpen(false);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const buildPayload = () => ({
    teacherAssignment: form.teacherAssignment,
    title: form.title,
    type: form.type,
    instructions: form.instructions || undefined,
    duration: Number(form.duration) || undefined,
    availableFrom: form.availableFrom,
    availableTo: form.availableTo,
    maxAttempts: Number(form.maxAttempts) || 1,
    passingScore: form.passingScore === "" ? undefined : Number(form.passingScore),
    shuffleQuestions: form.shuffleQuestions,
    shuffleOptions: form.shuffleOptions,
    showScoreImmediately: form.showScoreImmediately,
    showCorrectAnswers: form.showCorrectAnswers,
  });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await assessmentService.create(buildPayload());
      toast.success("Assessment created (draft) — add questions, then publish it");
      setFormOpen(false);
      setForm(emptyForm);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Type", accessor: "type" },
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Availability", accessor: "window" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={FaEye} onClick={() => openQuestions(row)} />
          <Button
            variant="ghost"
            size="sm"
            icon={row.status === "published" ? FaBan : FaCheckCircle}
            loading={busyId === row._id}
            onClick={() => togglePublish(row)}
          />
        </div>
      ),
    },
  ];

  const questionOptions = bank.map((question) => ({
    value: question._id,
    label: question.question,
  }));

  return (
    <>
      <ManagePage
        title="My Assessments"
        subtitle="Create, publish, and manage assessments for your class subjects"
        actionLabel="New Assessment"
        onAdd={() => {
          setForm(emptyForm);
          setFormOpen(true);
        }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assessments..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No assessments yet"
        emptyDescription="Create an assessment for one of your assigned class subjects."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Assessment"
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Select
          label="Class Subject"
          name="teacherAssignment"
          value={form.teacherAssignment}
          onChange={(e) => setForm({ ...form, teacherAssignment: e.target.value })}
          options={assignmentOptions}
          placeholder="Select class subject"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Select
            label="Type"
            name="type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={typeOptions}
          />
        </div>
        <Textarea
          label="Instructions"
          name="instructions"
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          rows={3}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Opens"
            name="availableFrom"
            type="datetime-local"
            value={form.availableFrom}
            onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
            required
          />
          <Input
            label="Closes"
            name="availableTo"
            type="datetime-local"
            value={form.availableTo}
            onChange={(e) => setForm({ ...form, availableTo: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Duration (mins)"
            name="duration"
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
          <Input
            label="Max Attempts"
            name="maxAttempts"
            type="number"
            value={form.maxAttempts}
            onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
          />
          <Input
            label="Pass Score (%)"
            name="passingScore"
            type="number"
            value={form.passingScore}
            onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Toggle label="Shuffle questions" enabled={form.shuffleQuestions} onChange={(v) => setForm({ ...form, shuffleQuestions: v })} />
          <Toggle label="Shuffle options" enabled={form.shuffleOptions} onChange={(v) => setForm({ ...form, shuffleOptions: v })} />
          <Toggle label="Show score immediately" enabled={form.showScoreImmediately} onChange={(v) => setForm({ ...form, showScoreImmediately: v })} />
          <Toggle label="Show correct answers" enabled={form.showCorrectAnswers} onChange={(v) => setForm({ ...form, showCorrectAnswers: v })} />
        </div>
      </FormModal>

      <Modal
        isOpen={questionsOpen}
        onClose={() => setQuestionsOpen(false)}
        title={`Questions — ${selected?.title || ""}`}
        maxWidth="xl"
      >
        <p className="text-sm text-slate-gray mb-3">
          Pick questions from your bank to attach (same subject shown first).
        </p>
        {bank.length === 0 ? (
          <p className="text-sm text-slate-gray">
            No questions in your bank for this subject yet — create some in the Question Bank.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto pr-1">
            <CheckboxGroup
              options={questionOptions}
              selectedValues={questionIds}
              onChange={setQuestionIds}
            />
          </div>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setQuestionsOpen(false)}>Done</Button>
          <Button icon={FaPlus} onClick={submitQuestions} loading={saving} disabled={bank.length === 0}>
            Add Selected ({questionIds.length})
          </Button>
        </div>
      </Modal>
    </>
  );
}
