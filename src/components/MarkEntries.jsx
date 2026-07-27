import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaCog, FaSave } from "react-icons/fa";

import subjectScoreService from "../services/subjectScoreService";
import classSubjectService from "../services/classSubjectService";
import { displayName } from "../utils/apiData";

import PageHeader from "./common/PageHeader";
import Loader from "./common/Loader";
import ErrorState from "./common/ErrorState";
import EmptyState from "./common/EmptyState";
import Card from "./ui/Card";
import Select from "./ui/Select";
import Button from "./ui/Button";
import Toggle from "./ui/Toggle";
import Modal from "./ui/Modal";
import GradeBadge from "./GradeBadge";

// Shared Mark Entries grid for admin and teacher.
//
// classOptions / subjectOptionsFor are supplied by the wrapping page so the
// two roles can scope them differently (admin: every class / every subject
// linked to it; teacher: only classes+subjects they're assigned to).
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

  const [configOpen, setConfigOpen] = useState(false);
  const [configDraft, setConfigDraft] = useState([]);
  const [configSaving, setConfigSaving] = useState(false);

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

  const openConfig = () => {
    setConfigDraft(
      allComponents.length > 0
        ? allComponents.map((c) => ({ ...c }))
        : [
            { key: "quiz", label: "Quiz", maxMarks: 10, isActive: true },
            { key: "assignment", label: "Assignment", maxMarks: 10, isActive: true },
            { key: "test", label: "Test", maxMarks: 20, isActive: true },
            { key: "exam", label: "Examination", maxMarks: 60, isActive: true },
          ],
    );
    setConfigOpen(true);
  };

  const updateConfigField = (index, field, value) => {
    setConfigDraft((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  const addConfigColumn = () => {
    setConfigDraft((prev) => [
      ...prev,
      { key: "", label: "", maxMarks: 10, isActive: true },
    ]);
  };

  const removeConfigColumn = (index) => {
    setConfigDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const saveConfig = async () => {
    if (!grid) return;
    const cleaned = configDraft
      .map((c) => ({
        key: (c.key || c.label || "").trim().toLowerCase().replace(/\s+/g, "-"),
        label: (c.label || "").trim(),
        maxMarks: Number(c.maxMarks) || 0,
        isActive: c.isActive !== false,
      }))
      .filter((c) => c.key && c.label);

    if (cleaned.length === 0) {
      toast.error("Add at least one score column.");
      return;
    }

    setConfigSaving(true);
    try {
      await classSubjectService.updateScoreComponents(grid.classSubject._id, {
        scoreComponents: cleaned,
      });
      toast.success("Score columns updated");
      setConfigOpen(false);
      await loadGrid();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setConfigSaving(false);
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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={FaCog} onClick={openConfig}>
                Manage Columns
              </Button>
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
          </div>

          {allComponents.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No score columns configured"
                description='Click "Manage Columns" to set up quiz, assignment, test, exam, etc. for this subject.'
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
            before saving. Scores from a published assessment (matching the
            column's type) prefill automatically; the latest attempt always
            overwrites the column.
          </p>
        </Card>
      )}

      <Modal
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        title="Manage Score Columns"
        maxWidth="lg"
      >
        <div className="space-y-3">
          {configDraft.map((component, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={component.label}
                onChange={(e) => updateConfigField(index, "label", e.target.value)}
                placeholder="Column label (e.g. Quiz)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue"
              />
              <input
                type="number"
                min={0}
                value={component.maxMarks}
                onChange={(e) => updateConfigField(index, "maxMarks", e.target.value)}
                placeholder="Max"
                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue"
              />
              <Toggle
                enabled={component.isActive}
                onChange={(value) => updateConfigField(index, "isActive", value)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeConfigColumn(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addConfigColumn}>
            Add Column
          </Button>
          <p className="text-xs text-slate-gray">
            Turning a column off excludes it from the total but keeps any scores
            already entered — turn it back on any time without losing data.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveConfig} loading={configSaving}>
              Save Columns
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
