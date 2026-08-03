import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import resultService from "../../services/resultService";
import dashboardService from "../../services/dashboardService";
import teacherAssignmentService from "../../services/teacherAssignmentService";
import useApi from "../../hooks/useApi";
import useMyTeaching from "../../hooks/useMyTeaching";
import { asArray, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import GradeBadge from "../../components/GradeBadge";

const typeOptions = [
  { value: "Quiz", label: "Quiz" },
  { value: "Test", label: "Test" },
  { value: "Assignment", label: "Assignment" },
  { value: "Examination", label: "Examination" },
  { value: "Manual", label: "Manual" },
];

const emptyForm = {
  student: "",
  title: "",
  type: "Manual",
  score: "",
  totalMarks: "",
  remark: "",
};

export default function ViewResultsPage() {
  const { data, loading, error, refetch } = useApi(resultService.list);
  const dashboardApi = useApi(dashboardService.getDashboard);
  const { assignments } = useMyTeaching();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const results = asArray(data);
  const context = dashboardApi.data?.context || null;

  // Students eligible for a manually-recorded result = the teacher's actual
  // class roster (every student across every one of the teacher's
  // assignments), not students who already happen to have a result — that
  // would make it impossible to ever record a student's *first* result.
  useEffect(() => {
    if (assignments.length === 0) {
      setRoster([]);
      return undefined;
    }

    let cancelled = false;
    setRosterLoading(true);

    Promise.all(
      assignments.map((assignment) =>
        teacherAssignmentService
          .students(assignment.id)
          .then((payload) => asArray(payload))
          .catch(() => []),
      ),
    )
      .then((rosters) => {
        if (cancelled) return;
        const map = new Map();
        rosters.flat().forEach((entry) => {
          const student = entry.student || {};
          const id = student._id || entry.student;
          if (id && !map.has(id)) {
            map.set(id, {
              value: id,
              label:
                displayName(student.user) ||
                student.admissionNumber ||
                "Student",
            });
          }
        });
        setRoster(Array.from(map.values()));
      })
      .finally(() => {
        if (!cancelled) setRosterLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assignments]);

  const studentOptions = roster;

  const rows = results.map((result) => ({
    _id: result._id,
    student: displayName(result.student?.user) || "—",
    title: result.title || "—",
    subject:
      result.classSubject?.subject?.name || result.metadata?.subjectName || "—",
    class: result.classSubject?.schoolClass
      ? `${result.classSubject.schoolClass.className || ""} ${result.classSubject.schoolClass.arm || ""}`.trim()
      : "—",
    score: `${result.score ?? 0}/${result.totalMarks ?? 0}`,
    percentage: `${result.percentage ?? 0}%`,
    grade: result.grade,
    type: result.type || "—",
    __doc: result,
    __search:
      `${displayName(result.student?.user)} ${result.title} ${result.type}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Title", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Score", accessor: "score" },
    { header: "%", accessor: "percentage" },
    {
      header: "Grade",
      accessor: "grade",
      render: (row) => <GradeBadge grade={row.grade} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEdit}
            title="Edit result"
            onClick={() => {
              setSelected(row.__doc);
              setForm({
                student: row.__doc.student?._id || row.__doc.student || "",
                title: row.__doc.title || "",
                type: row.__doc.type || "Manual",
                score: row.__doc.score ?? "",
                totalMarks: row.__doc.totalMarks ?? "",
                remark: row.__doc.remark || "",
              });
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            title="Delete result"
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

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        student: form.student,
        title: form.title,
        type: form.type,
        score: Number(form.score) || 0,
        totalMarks: Number(form.totalMarks) || 0,
        remark: form.remark || undefined,
        session: context?.session?._id,
        term: context?.term?._id,
      };
      if (selected) {
        await resultService.update(selected._id, {
          score: payload.score,
          totalMarks: payload.totalMarks,
          remark: payload.remark,
          title: payload.title,
          session: payload.session,
          term: payload.term,
        });
        toast.success("Result updated");
      } else {
        await resultService.create(payload);
        toast.success("Result recorded");
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
      await resultService.remove(selected._id);
      toast.success("Result deleted");
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
        title="Results"
        subtitle="Review, edit, and record results for your students"
        actionLabel="Record Result"
        onAdd={() => {
          setSelected(null);
          setForm(emptyForm);
          setFormOpen(true);
        }}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search results..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No results yet"
        emptyDescription="Results appear once assessments are submitted, or record one manually."
      />

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Result" : "Record Result"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <Select
          label="Student"
          name="student"
          value={form.student}
          onChange={set("student")}
          options={studentOptions}
          placeholder={rosterLoading ? "Loading students..." : "Select student"}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Mid-term test"
            required
          />
          <Select
            label="Type"
            name="type"
            value={form.type}
            onChange={set("type")}
            options={typeOptions}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Score"
            name="score"
            type="number"
            value={form.score}
            onChange={set("score")}
            required
          />
          <Input
            label="Total Marks"
            name="totalMarks"
            type="number"
            value={form.totalMarks}
            onChange={set("totalMarks")}
            required
          />
        </div>
        <Textarea
          label="Remark"
          name="remark"
          value={form.remark}
          onChange={set("remark")}
          rows={2}
        />
        <p className="text-xs text-slate-gray">
          Recorded under the current session and term (
          {context?.session?.name || "…"} · {context?.term?.name || "…"}).
        </p>
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Result"
        message={`Delete "${selected?.title}" result? This cannot be undone.`}
      />
    </>
  );
}
