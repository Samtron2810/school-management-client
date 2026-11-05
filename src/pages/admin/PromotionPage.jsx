import { useState } from "react";
import toast from "react-hot-toast";

import promotionService from "../../services/promotionService";
import classService from "../../services/classService";
import sessionService from "../../services/sessionService";
import termService from "../../services/termService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import FormModal from "../../components/modals/FormModal";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";

const emptyForm = {
  fromClass: "",
  toClass: "",
  targetSession: "",
  targetTerm: "",
};

export default function PromotionPage() {
  const { data, loading, error, refetch } = useApi(promotionService.list);
  const classesApi = useApi(classService.list);
  const sessionsApi = useApi(sessionService.list);

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [graduate, setGraduate] = useState(false);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [repeatIds, setRepeatIds] = useState([]);
  const [targetTerms, setTargetTerms] = useState([]);
  const [saving, setSaving] = useState(false);

  const rows = asArray(data).map((promotion) => ({
    _id: promotion._id,
    fromClass: classLabel(promotion.fromClass),
    toClass: promotion.isGraduation ? "Graduated" : classLabel(promotion.toClass),
    route: `${promotion.sourceSession?.name || "current"} → ${promotion.targetSession?.name || "N/A"}`,
    targetTerm: promotion.targetTerm?.name || "N/A",
    processed: (
      <div className="flex flex-wrap gap-1">
        <Badge variant="success">{promotion.promotedCount || 0} promoted</Badge>
        {promotion.repeatedCount > 0 && (
          <Badge variant="warning">{promotion.repeatedCount} repeating</Badge>
        )}
        {promotion.graduatedCount > 0 && (
          <Badge variant="info">{promotion.graduatedCount} graduated</Badge>
        )}
        {promotion.skippedCount > 0 && (
          <Badge variant="default">{promotion.skippedCount} skipped</Badge>
        )}
      </div>
    ),
    by: displayName(promotion.promotedBy) || "N/A",
    date: formatDate(promotion.createdAt),
    __search:
      `${classLabel(promotion.fromClass)} ${classLabel(promotion.toClass)}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));
  const sessionOptions = asArray(sessionsApi.data).map((session) => ({
    value: session._id,
    label: session.name,
  }));
  const termOptions = targetTerms.map((term) => ({
    value: term._id,
    label: term.name,
  }));

  const columns = [
    { header: "From", accessor: "fromClass" },
    { header: "To", accessor: "toClass" },
    { header: "Session Route", accessor: "route" },
    { header: "Target Term", accessor: "targetTerm" },
    { header: "Outcome", accessor: "processed" },
    { header: "By", accessor: "by" },
    { header: "Date", accessor: "date" },
  ];

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setGraduate(false);
    setRoster([]);
    setRepeatIds([]);
    setTargetTerms([]);
  };

  // Load the class list so the admin can tick students who repeat.
  const pickFromClass = async (e) => {
    const fromClass = e.target.value;
    setForm((prev) => ({ ...prev, fromClass }));
    setRepeatIds([]);
    setRoster([]);
    setRosterLoading(true);
    try {
      const result = await promotionService.roster({ fromClass });
      setRoster(asArray(result?.students));
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setRosterLoading(false);
    }
  };

  // Only the terms of the chosen target session can be selected.
  const pickTargetSession = async (e) => {
    const targetSession = e.target.value;
    setForm((prev) => ({ ...prev, targetSession, targetTerm: "" }));
    setTargetTerms([]);
    try {
      const terms = await termService.list({ session: targetSession });
      setTargetTerms(
        asArray(terms).sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate),
        ),
      );
    } catch {
      // handled by the axios interceptor toast
    }
  };

  const toggleRepeat = (studentId) =>
    setRepeatIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );

  const handleSubmit = async () => {
    if (roster.length === 0) {
      toast.error("This class has no active students to promote.");
      return;
    }
    setSaving(true);
    try {
      const promotion = await promotionService.promote({
        fromClass: form.fromClass,
        ...(graduate ? { graduate: true } : { toClass: form.toClass }),
        targetSession: form.targetSession,
        targetTerm: form.targetTerm,
        repeatStudentIds: repeatIds,
      });

      const parts = [
        promotion.promotedCount && `${promotion.promotedCount} promoted`,
        promotion.repeatedCount && `${promotion.repeatedCount} repeating`,
        promotion.graduatedCount && `${promotion.graduatedCount} graduated`,
        promotion.skippedCount && `${promotion.skippedCount} skipped`,
      ].filter(Boolean);
      toast.success(parts.join(", ") || "Promotion completed");

      closeForm();
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  const movingCount = roster.length - repeatIds.length;

  return (
    <>
      <ManagePage
        title="Promotions"
        subtitle="Move a class into the next session — promote, repeat or graduate"
        actionLabel="Run Promotion"
        onAdd={() => setFormOpen(true)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search promotions..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No promotions yet"
        emptyDescription="Run the first class promotion."
      />

      <FormModal
        isOpen={formOpen}
        onClose={closeForm}
        title="Run Promotion"
        onSubmit={handleSubmit}
        submitLabel={graduate ? "Graduate" : "Promote"}
        loading={saving}
      >
        <Select
          label="From Class"
          name="fromClass"
          value={form.fromClass}
          onChange={pickFromClass}
          options={classOptions}
          placeholder="Select current class"
          required
        />

        <label className="flex items-center gap-2 text-sm text-primary">
          <input
            type="checkbox"
            checked={graduate}
            onChange={(e) => setGraduate(e.target.checked)}
            className="w-4 h-4 accent-coral"
          />
          Final class — graduate these students (no next class)
        </label>

        {!graduate && (
          <Select
            label="To Class"
            name="toClass"
            value={form.toClass}
            onChange={set("toClass")}
            options={classOptions}
            placeholder="Select new class"
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target Session"
            name="targetSession"
            value={form.targetSession}
            onChange={pickTargetSession}
            options={sessionOptions}
            placeholder="Select target session"
            required
          />
          <Select
            label="Target Term"
            name="targetTerm"
            value={form.targetTerm}
            onChange={set("targetTerm")}
            options={termOptions}
            placeholder={
              form.targetSession ? "Select target term" : "Pick a session first"
            }
            disabled={!form.targetSession}
            required
          />
        </div>

        {form.fromClass && (
          <div>
            <p className="text-sm font-medium text-primary mb-1">
              Students
              {roster.length > 0 && (
                <span className="font-normal text-slate-gray">
                  {" "}
                  — {movingCount} {graduate ? "graduating" : "moving up"}
                  {repeatIds.length > 0 && `, ${repeatIds.length} repeating`}
                </span>
              )}
            </p>
            <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {rosterLoading ? (
                <p className="p-3 text-sm text-slate-gray">Loading students...</p>
              ) : roster.length === 0 ? (
                <p className="p-3 text-sm text-slate-gray">
                  No active students in this class for the current session. It
                  may already have been promoted.
                </p>
              ) : (
                roster.map(({ student }) => (
                  <label
                    key={student._id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                  >
                    <span className="text-primary">
                      {displayName(student.user) || "Student"}
                      {student.admissionNumber && (
                        <span className="text-slate-gray">
                          {" "}
                          · {student.admissionNumber}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-gray">
                      Repeats
                      <input
                        type="checkbox"
                        checked={repeatIds.includes(student._id)}
                        onChange={() => toggleRepeat(student._id)}
                        className="w-4 h-4 accent-coral"
                      />
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-gray">
          Everyone in the class is moved unless ticked as repeating (they stay
          in this class next session). Scores and report cards of the old
          session are kept. This cannot be undone from here.
        </p>
      </FormModal>
    </>
  );
}
