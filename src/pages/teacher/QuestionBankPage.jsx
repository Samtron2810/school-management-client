import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCopy, FaEdit, FaTrashAlt } from "react-icons/fa";

import questionService from "../../services/questionService";
import useMyTeaching from "../../hooks/useMyTeaching";
import { asArray, getPagination } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/common/Pagination";

const difficultyOptions = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const optionKeys = ["A", "B", "C", "D"];

const emptyForm = {
  teacherAssignment: "",
  question: "",
  options: { A: "", B: "", C: "", D: "" },
  correctAnswer: "A",
  marks: 1,
  difficulty: "Medium",
  explanation: "",
};

function toForm(doc) {
  const options = { A: "", B: "", C: "", D: "" };
  (doc.options || []).forEach((opt) => {
    if (options[opt.key] !== undefined) options[opt.key] = opt.text;
  });
  return {
    teacherAssignment:
      doc.teacherAssignment?._id || doc.teacherAssignment || "",
    question: doc.question || "",
    options,
    correctAnswer: doc.correctAnswer || "A",
    marks: doc.marks || 1,
    difficulty: doc.difficulty || "Medium",
    explanation: doc.explanation || "",
  };
}

export default function QuestionBankPage() {
  const {
    assignments,
    classes,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useMyTeaching();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkForm, setBulkForm] = useState({
    teacherAssignment: "",
    marks: 1,
    difficulty: "Medium",
  });

  const load = async (targetPage = page, targetSearch = search) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await questionService.list({
        page: targetPage,
        limit: 10,
        search: targetSearch || undefined,
      });
      setData(payload);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Scheduled so the state updates land outside the effect body.
    const id = setTimeout(() => load(1, search), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
    load(1, value);
  };

  const questions = asArray(data);
  const pagination = getPagination(data);

  const rows = questions.map((question) => ({
    _id: question._id,
    question: question.question || "—",
    subject: question.classSubject?.subject?.name || "—",
    class: question.classSubject?.schoolClass
      ? `${question.classSubject.schoolClass.className || ""} ${question.classSubject.schoolClass.arm || ""}`.trim()
      : "—",
    answer: question.correctAnswer || "—",
    marks: question.marks ?? "—",
    difficulty: question.difficulty || "—",
    date: formatDate(question.createdAt),
    __doc: question,
  }));

  const filtered = rows.filter((row) => {
    return !classFilter || row.class === classFilter;
  });

  const assignmentOptions = assignments.map((assignment) => ({
    value: assignment.id,
    label: assignment.label,
  }));

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={
            selectedIds.length === filtered.length && filtered.length > 0
          }
          onChange={(e) =>
            setSelectedIds(
              e.target.checked ? filtered.map((row) => row._id) : [],
            )
          }
          className="w-4 h-4"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row._id)}
          onChange={() => toggleSelect(row._id)}
          className="w-4 h-4"
        />
      ),
    },
    {
      header: "Question",
      accessor: "question",
      render: (row) => (
        <span className="line-clamp-2 max-w-md">{row.question}</span>
      ),
    },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Answer", accessor: "answer" },
    { header: "Marks", accessor: "marks" },
    {
      header: "Difficulty",
      accessor: "difficulty",
      render: (row) => (
        <Badge
          variant={
            row.difficulty === "Easy"
              ? "success"
              : row.difficulty === "Hard"
                ? "danger"
                : "warning"
          }
        >
          {row.difficulty}
        </Badge>
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
            title="Edit question"
            onClick={() => {
              setSelected(row.__doc);
              setForm(toForm(row.__doc));
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaCopy}
            title="Duplicate question"
            onClick={async () => {
              try {
                await questionService.duplicate(row._id);
                toast.success("Question duplicated");
                load();
              } catch {
                // handled by the axios interceptor toast
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            title="Delete question"
            onClick={() => {
              setSelected(row.__doc);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  const buildPayload = () => ({
    teacherAssignment: form.teacherAssignment,
    question: form.question,
    options: optionKeys.map((key) => ({ key, text: form.options[key] })),
    correctAnswer: form.correctAnswer,
    marks: Number(form.marks) || 1,
    difficulty: form.difficulty,
    explanation: form.explanation || undefined,
    isPublished: true,
  });

  const handleSubmit = async (andAddAnother = false) => {
    setSaving(true);
    try {
      const payload = buildPayload();
      if (selected) {
        const updatePayload = { ...payload };
        delete updatePayload.teacherAssignment;
        await questionService.update(selected._id, updatePayload);
        toast.success("Question updated");
        setFormOpen(false);
        setSelected(null);
        setForm(emptyForm);
      } else {
        await questionService.create(payload);
        toast.success("Question created successfully");
        if (andAddAnother) {
          setForm((prev) => ({
            ...prev,
            question: "",
            options: { A: "", B: "", C: "", D: "" },
            correctAnswer: "A",
            explanation: "",
          }));
        } else {
          setFormOpen(false);
          setSelected(null);
          setForm(emptyForm);
        }
      }
      load();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      if (selected) {
        await questionService.remove(selected._id);
      } else if (selectedIds.length > 0) {
        await questionService.bulkRemove({ questionIds: selectedIds });
        setSelectedIds([]);
      }
      toast.success("Question(s) deleted");
      setDeleteOpen(false);
      setSelected(null);
      load();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const parseAiken = (text) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const questionsList = [];
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const optionMatch = line.match(/^([A-D])[\.\)]\s+(.+)$/i);
      const answerMatch = line.match(/^ANSWER:\s*([A-D])$/i);

      if (optionMatch) {
        if (currentQuestion) {
          const key = optionMatch[1].toUpperCase();
          currentQuestion.options[key] = optionMatch[2];
        }
      } else if (answerMatch) {
        if (currentQuestion) {
          currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
          const keys = Object.keys(currentQuestion.options);
          if (keys.length === 4 && currentQuestion.correctAnswer) {
            questionsList.push(currentQuestion);
          }
          currentQuestion = null;
        }
      } else {
        if (currentQuestion) {
          const keys = Object.keys(currentQuestion.options);
          if (keys.length === 4 && currentQuestion.correctAnswer) {
            questionsList.push(currentQuestion);
          }
        }
        currentQuestion = {
          question: line,
          options: {},
          correctAnswer: "",
        };
      }
    }

    if (currentQuestion) {
      const keys = Object.keys(currentQuestion.options);
      if (keys.length === 4 && currentQuestion.correctAnswer) {
        questionsList.push(currentQuestion);
      }
    }

    return questionsList;
  };

  const handleBulkSubmit = async () => {
    if (!bulkForm.teacherAssignment) {
      toast.error("Please select a Class Subject");
      return;
    }
    if (!bulkText.trim()) {
      toast.error("Please paste your Aiken-formatted questions");
      return;
    }
    setSaving(true);
    try {
      const parsed = parseAiken(bulkText);
      if (parsed.length === 0) {
        toast.error(
          "No valid questions parsed. Make sure they strictly follow the Aiken format.",
        );
        setSaving(false);
        return;
      }

      await Promise.all(
        parsed.map((q) =>
          questionService.create({
            teacherAssignment: bulkForm.teacherAssignment,
            question: q.question,
            options: Object.keys(q.options).map((key) => ({
              key,
              text: q.options[key],
            })),
            correctAnswer: q.correctAnswer,
            marks: Number(bulkForm.marks) || 1,
            difficulty: bulkForm.difficulty,
            isPublished: true,
          }),
        ),
      );

      toast.success(`Successfully imported ${parsed.length} questions!`);
      setBulkOpen(false);
      setBulkText("");
      load(1);
    } catch {
      toast.error("Failed to import some questions. Please check format.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ManagePage
        title="Question Bank"
        subtitle="Create and reuse multiple-choice questions"
        actionLabel="New Question"
        onAdd={() => {
          setSelected(null);
          setForm(emptyForm);
          setFormOpen(true);
        }}
        searchValue={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search questions..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error || assignmentsError}
        onRetry={() => {
          load();
          refetchAssignments();
        }}
        emptyTitle="No questions yet"
        emptyDescription="Create multiple-choice questions for your class subjects."
        toolbar={
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="w-44">
              <Select
                name="class-filter"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                options={[
                  { value: "", label: "All Classes" },
                  ...classes.map((c) => ({ value: c, label: c })),
                ]}
                placeholder="Filter by Class"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setBulkText("");
                setBulkForm({
                  teacherAssignment: assignmentOptions[0]?.value || "",
                  marks: 1,
                  difficulty: "Medium",
                });
                setBulkOpen(true);
              }}
            >
              Bulk Import (Aiken)
            </Button>
            {selectedIds.length > 0 && (
              <Button
                variant="danger"
                icon={FaTrashAlt}
                onClick={() => {
                  setSelected(null);
                  setDeleteOpen(true);
                }}
              >
                Delete ({selectedIds.length})
              </Button>
            )}
          </div>
        }
      />

      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(p) => {
            setPage(p);
            load(p);
          }}
        />
      )}

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Question" : "New Question"}
        onSubmit={() => handleSubmit(false)}
        onSaveAndAddAnother={selected ? null : () => handleSubmit(true)}
        loading={saving}
      >
        <Select
          label="Class Subject"
          name="teacherAssignment"
          value={form.teacherAssignment}
          onChange={(e) =>
            setForm({ ...form, teacherAssignment: e.target.value })
          }
          options={assignmentOptions}
          placeholder="Select class subject"
          required={!selected}
        />
        <Textarea
          label="Question"
          name="question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          rows={3}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {optionKeys.map((key) => (
            <Input
              key={key}
              label={`Option ${key}`}
              name={`option${key}`}
              value={form.options[key]}
              onChange={(e) =>
                setForm({
                  ...form,
                  options: { ...form.options, [key]: e.target.value },
                })
              }
              required
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Select
            label="Correct Answer"
            name="correctAnswer"
            value={form.correctAnswer}
            onChange={(e) =>
              setForm({ ...form, correctAnswer: e.target.value })
            }
            options={optionKeys.map((key) => ({ value: key, label: key }))}
          />
          <Input
            label="Marks"
            name="marks"
            type="number"
            value={form.marks}
            onChange={(e) => setForm({ ...form, marks: e.target.value })}
          />
          <Select
            label="Difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            options={difficultyOptions}
          />
        </div>
        <Textarea
          label="Explanation (optional)"
          name="explanation"
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          rows={2}
        />
      </FormModal>

      <FormModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Import Questions (Aiken Format)"
        onSubmit={handleBulkSubmit}
        loading={saving}
      >
        <Select
          label="Class Subject"
          name="bulk-teacherAssignment"
          value={bulkForm.teacherAssignment}
          onChange={(e) =>
            setBulkForm({ ...bulkForm, teacherAssignment: e.target.value })
          }
          options={assignmentOptions}
          placeholder="Select class subject"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Default Marks"
            name="bulk-marks"
            type="number"
            value={bulkForm.marks}
            onChange={(e) =>
              setBulkForm({ ...bulkForm, marks: e.target.value })
            }
          />
          <Select
            label="Default Difficulty"
            name="bulk-difficulty"
            value={bulkForm.difficulty}
            onChange={(e) =>
              setBulkForm({ ...bulkForm, difficulty: e.target.value })
            }
            options={difficultyOptions}
          />
        </div>
        <Textarea
          label="Aiken Text"
          name="bulk-text"
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={`What is the capital of France?\nA. London\nB. Paris\nC. Rome\nD. Berlin\nANSWER: B\n\nWhich planet is closest to the sun?\nA. Venus\nB. Earth\nC. Mercury\nD. Mars\nANSWER: C`}
          rows={10}
          required
        />
        <p className="text-xs text-slate-gray">
          Aiken format rules: Every question must have exactly four options
          (labeled A., B., C., D. followed by a space) and a final line starting
          with "ANSWER: " followed by the correct choice.
        </p>
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={handleDelete}
        title={selected ? "Delete Question" : "Delete Questions"}
        message={
          selected
            ? "Delete this question?"
            : `Delete ${selectedIds.length} selected question(s)? This cannot be undone.`
        }
      />
    </>
  );
}
