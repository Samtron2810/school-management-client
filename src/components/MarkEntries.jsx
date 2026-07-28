import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaSave } from "react-icons/fa";

import subjectScoreService from "../services/subjectScoreService";
import { displayName } from "../utils/apiData";

import PageHeader from "./common/PageHeader";
import Loader from "./common/Loader";
import ErrorState from "./common/ErrorState";
import EmptyState from "./common/EmptyState";
import Card from "./ui/Card";
import Select from "./ui/Select";
import Button from "./ui/Button";
import GradeBadge from "./GradeBadge";

// Shared Mark Entries grid for admin and teacher.
//
// classOptions / subjectOptionsFor are supplied by the wrapping page so the
// two roles can scope them differently (admin: every class / every subject
// linked to it; teacher: only classes+subjects they're assigned to).
//
// Score-entry columns (CA 1, CA 2, Test, Exam, etc) are global and
// admin-managed (School Settings > Mark Entry Columns) — no one can
// configure them from this page. Inactive columns still show here
// (read-only) so past scores stay visible, they just don't count toward
// the total.
export default function MarkEntries({
  classOptions,
  subjectOptionsFor, // (schoolClassId) => [{ value, label }]
  classOptionsLoading,
}) {
  const [schoolClass, setSchoolClass] = useState("");
  const [subject, setSubject] = useState("");
  const [grid, setGrid] = useState(null); // full payload from subjectScoreService.grid
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Local edit buffer: { [studentId]: { [componentKey]: "8" } }
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);

  const subjectOptions = useMemo(
    () => (schoolClass ? subjectOptionsFor(schoolClass) : []),
    [schoolClass, subjectOptionsFor],
  );

  // Reset subject + grid whenever the class changes.
  useEffect(() => {
    setSubject("");
    setGrid(null);
    setEdits({});
  }, [schoolClass]);

  const loadGrid = async () => {
    if (!schoolClass || !subject) return;
    setLoading(true);
    setLoadError(null);
    try {
      const payload = await subjectScoreService.grid({
        schoolClass,
        subject,
      });
      setGrid(payload);
      setEdits({});
    } catch (err) {
      setLoadError(err);
      setGrid(null);
    } finally {
      setLoading(false);
    }
  };

  const allComponents = grid?.scoreComponents || [];

  const getValue = (studentId, key) => {
    if (edits[studentId]?.[key] !== undefined) return edits[studentId][key];
    const student = grid?.students.find((s) => s.student._id === studentId);
    const existing = student?.scores?.[key];
    return existing === undefined || existing === null ? "" : String(existing);
  };

  const setValue = (studentId, key, value) => {
    setEdits((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [key]: value },
    }));
  };

  const hasUnsavedEdits = Object.keys(edits).length > 0;

  const handleSaveAll = async () => {
    if (!grid) return;
    const studentIds = Object.keys(edits);
    if (studentIds.length === 0) {
      toast.error("No changes to save.");
      return;
    }

    const entries = studentIds.map((studentId) => ({
      student: studentId,
      scores: edits[studentId],
    }));

    setSaving(true);
    try {
      const result = await subjectScoreService.bulkSave({
        classSubject: grid.classSubject._id,
        entries,
      });
      if (result.failedCount > 0) {
        toast.error(
          `${result.savedCount} saved, ${result.failedCount} failed. Check the failed entries and retry.`,
        );
      } else {
        toast.success(`${result.savedCount} score(s) saved`);
      }
      await loadGrid();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Mark Entries"
        subtitle="Enter and review subject scores for a class"
      />

      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Select
            label="Class"
            name="schoolClass"
            value={schoolClass}
            onChange={(e) => setSchoolClass(e.target.value)}
            options={classOptions}
            placeholder={classOptionsLoading ? "Loading classes..." : "Select class"}
          />
          <Select
            label="Subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={subjectOptions}
            placeholder={
              !schoolClass
                ? "Select a class first"
                : subjectOptions.length === 0
                  ? "No subjects for this class"
                  : "Select subject"
            }
            disabled={!schoolClass}
          />
          <Button
            onClick={loadGrid}
            disabled={!schoolClass || !subject}
            loading={loading}
          >
            Filter
          </Button>
        </div>
      </Card>

      {loading ? (
        <Loader text="Loading mark entries..." />
      ) : loadError ? (
        <ErrorState onRetry={loadGrid} />
      ) : !grid ? (
        <EmptyState
          title="No class/subject selected"
          description="Choose a class and subject above, then click Filter to load the mark entry sheet."
        />
      ) : (
        <Card padding={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-primary">
                {grid.classSubject?.schoolClass?.className}{" "}
                {grid.classSubject?.schoolClass?.arm} ·{" "}
                {grid.classSubject?.subject?.name}
              </h2>
              <p className="text-xs text-slate-gray mt-0.5">
                {grid.session?.name} · {grid.term?.name} · {grid.students.length} student
                {grid.students.length === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              size="sm"
              icon={FaSave}
              onClick={handleSaveAll}
              loading={saving}
              disabled={!hasUnsavedEdits}
            >
              Save All
            </Button>
          </div>

          {allComponents.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No score columns configured"
                description="Ask an admin to set up mark-entry columns under School Settings."
              />
            </div>
          ) : grid.students.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No students enrolled"
                description="No actively-enrolled students found in this class for the current session."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-slate-gray">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    {allComponents.map((component) => (
                      <th
                        key={component.key}
                        className={`px-4 py-3 font-medium whitespace-nowrap ${
                          !component.isActive ? "opacity-40" : ""
                        }`}
                        title={
                          component.isActive
                            ? undefined
                            : "Inactive — set by admin, read-only, excluded from the total"
                        }
                      >
                        {component.label}
                        <span className="text-xs text-slate-gray ml-1">
                          ({component.maxMarks})
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">%</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {grid.students.map((row, index) => (
                    <tr
                      key={row.student._id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-slate-gray">
                        {row.rollNumber ?? index + 1}
                      </td>
                      <td className="px-4 py-2 text-primary font-medium whitespace-nowrap">
                        {displayName(row.student.user) || row.student.admissionNumber}
                        {row.isPublished && (
                          <span className="ml-2 text-xs text-green-600">Published</span>
                        )}
                      </td>
                      {allComponents.map((component) => (
                        <td key={component.key} className="px-4 py-2">
                          <input
                            type="number"
                            min={0}
                            max={component.maxMarks}
                            step="0.01"
                            value={getValue(row.student._id, component.key)}
                            onChange={(e) =>
                              setValue(row.student._id, component.key, e.target.value)
                            }
                            disabled={!component.isActive}
                            title={
                              component.isActive
                                ? undefined
                                : "This column is inactive — set by admin"
                            }
                            className={`w-20 px-2 py-1.5 rounded-lg border text-sm text-primary focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-colors ${
                              !component.isActive
                                ? "bg-gray-50 border-gray-100 cursor-not-allowed text-slate-gray"
                                : "border-gray-200"
                            }`}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2 text-primary font-medium">
                        {row.total}/{row.totalMaxMarks}
                      </td>
                      <td className="px-4 py-2 text-slate-gray">{row.percentage}%</td>
                      <td className="px-4 py-2">
                        <GradeBadge grade={row.grade} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-slate-gray p-4 border-t border-gray-100">
            Fill in any fields you have — you don't need to complete every column
            before saving. Scores from a published assessment (Quiz → CA 1,
            Assignment → CA 2, Test → Test, Examination → Exam) prefill
            automatically; the latest attempt always overwrites the column.
            Columns are set by your school admin and apply to every class and
            subject.
          </p>
        </Card>
      )}
    </div>
  );
}
