import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaTrashAlt } from "react-icons/fa";

import settingService from "../../services/settingService";
import useApi from "../../hooks/useApi";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Toggle from "../../components/ui/Toggle";

const idFormatKinds = [
  { key: "teacher", label: "Teachers" },
  { key: "student", label: "Students" },
  { key: "parent", label: "Parents" },
];

// Admin school settings (GET/PATCH /settings): school profile, grading
// scheme (grade bands + passing score) used when results are computed, and
// the automatic ID formats used when staff/student/parent accounts are
// created without an explicit ID.
export default function SettingsPage() {
  const { data, loading, error, refetch } = useApi(settingService.get);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  // The form edits a draft copy of the last-fetched settings doc.
  const form = useMemo(() => {
    if (draft) return draft;
    if (!data) return null;
    return {
      schoolName: data.schoolName || "",
      address: data.address || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      logoUrl: data.logo?.url || "",
      passingScore: data.passingScore ?? 40,
      gradeBands: (data.gradeBands || []).map((band) => ({ ...band })),
      scoreComponents: (data.scoreComponents || []).map((component) => ({
        ...component,
      })),
      idFormats: {
        teacher: {
          prefix: data.idFormats?.teacher?.prefix ?? "TCH-",
          padding: data.idFormats?.teacher?.padding ?? 4,
          counter: data.idFormats?.teacher?.counter ?? 0,
        },
        student: {
          prefix: data.idFormats?.student?.prefix ?? "STU-",
          padding: data.idFormats?.student?.padding ?? 4,
          counter: data.idFormats?.student?.counter ?? 0,
        },
        parent: {
          prefix: data.idFormats?.parent?.prefix ?? "PAR-",
          padding: data.idFormats?.parent?.padding ?? 4,
          counter: data.idFormats?.parent?.counter ?? 0,
        },
      },
    };
  }, [draft, data]);

  if (loading) return <Loader text="Loading settings..." />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!form) return null;

  const update = (patch) => setDraft((prev) => ({ ...(prev || form), ...patch }));

  const setField = (field) => (e) => update({ [field]: e.target.value });

  const setBand = (index, field, value) =>
    update({
      gradeBands: form.gradeBands.map((band, i) =>
        i === index ? { ...band, [field]: value } : band,
      ),
    });

  const addBand = () =>
    update({
      gradeBands: [
        ...form.gradeBands,
        { grade: "", minScore: 0, gradePoint: 0, remark: "" },
      ],
    });

  const removeBand = (index) =>
    update({ gradeBands: form.gradeBands.filter((_, i) => i !== index) });

  const setComponent = (index, field, value) =>
    update({
      scoreComponents: form.scoreComponents.map((component, i) =>
        i === index ? { ...component, [field]: value } : component,
      ),
    });

  const addComponent = () =>
    update({
      scoreComponents: [
        ...form.scoreComponents,
        { key: "", label: "", maxMarks: 10, isActive: true },
      ],
    });

  const removeComponent = (index) =>
    update({ scoreComponents: form.scoreComponents.filter((_, i) => i !== index) });

  const setIdFormat = (kind, field, value) =>
    update({
      idFormats: {
        ...form.idFormats,
        [kind]: { ...form.idFormats[kind], [field]: value },
      },
    });

  const nextIdPreview = (kind) =>
    `${form.idFormats[kind].prefix}${String(
      form.idFormats[kind].counter + 1,
    ).padStart(Number(form.idFormats[kind].padding) || 4, "0")}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        schoolName: form.schoolName || undefined,
        address: form.address || undefined,
        email: form.email || undefined,
        phoneNumber: form.phoneNumber || undefined,
        logoUrl: form.logoUrl || undefined,
        passingScore: Number(form.passingScore),
        gradeBands: form.gradeBands
          .filter((band) => band.grade)
          .map((band) => ({
            grade: band.grade,
            minScore: Number(band.minScore) || 0,
            gradePoint: Number(band.gradePoint) || 0,
            remark: band.remark || "",
          })),
        scoreComponents: form.scoreComponents
          .filter((component) => component.label)
          .map((component) => ({
            key: (component.key || component.label)
              .trim()
              .toLowerCase()
              .replace(/\s+/g, ""),
            label: component.label.trim(),
            maxMarks: Number(component.maxMarks) || 0,
            isActive: component.isActive !== false,
          })),
        idFormats: Object.fromEntries(
          idFormatKinds.map(({ key }) => [
            key,
            {
              prefix: form.idFormats[key].prefix,
              padding: Number(form.idFormats[key].padding) || 4,
            },
          ]),
        ),
      };
      const saved = await settingService.update(payload);
      toast.success("Settings saved");
      setDraft(null);
      refetch();
      void saved;
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="School Settings"
        subtitle="School profile, grading scheme, and automatic ID formats"
        actions={
          <Button onClick={handleSave} loading={saving}>
            Save Settings
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School profile */}
        <Card>
          <h2 className="text-base font-semibold text-primary mb-4">
            School Profile
          </h2>
          <div className="space-y-4">
            <Input
              label="School Name"
              name="schoolName"
              value={form.schoolName}
              onChange={setField("schoolName")}
            />
            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={setField("address")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={setField("email")}
              />
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={setField("phoneNumber")}
              />
            </div>
            <Input
              label="Logo URL"
              name="logoUrl"
              value={form.logoUrl}
              onChange={setField("logoUrl")}
              placeholder="https://..."
            />
          </div>
        </Card>

        {/* Automatic ID formats */}
        <Card>
          <h2 className="text-base font-semibold text-primary mb-1">
            Automatic ID Formats
          </h2>
          <p className="text-xs text-slate-gray mb-4">
            Used when a teacher, student, or parent is registered without an
            ID. The counter itself is managed by the server.
          </p>
          <div className="space-y-3">
            {idFormatKinds.map(({ key, label }) => (
              <div
                key={key}
                className="grid grid-cols-[1fr_5rem_5rem_1fr] items-end gap-3"
              >
                <p className="text-sm font-medium text-primary pb-2">{label}</p>
                <Input
                  label="Prefix"
                  name={`${key}-prefix`}
                  value={form.idFormats[key].prefix}
                  onChange={(e) => setIdFormat(key, "prefix", e.target.value)}
                />
                <Input
                  label="Padding"
                  name={`${key}-padding`}
                  type="number"
                  min="1"
                  max="10"
                  value={form.idFormats[key].padding}
                  onChange={(e) => setIdFormat(key, "padding", e.target.value)}
                />
                <p className="text-xs text-slate-gray pb-2.5">
                  Next:{" "}
                  <span className="font-medium text-primary">
                    {nextIdPreview(key)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Grading scheme */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-primary">
              Grading Scheme
            </h2>
            <Button variant="outline" size="sm" icon={FaPlus} onClick={addBand}>
              Add Band
            </Button>
          </div>
          <p className="text-xs text-slate-gray mb-4">
            Grades are assigned from the highest matching minimum score; a
            result passes at or above the passing score.
          </p>

          <div className="max-w-xs mb-5">
            <Input
              label="Passing Score (%)"
              name="passingScore"
              type="number"
              min="0"
              max="100"
              value={form.passingScore}
              onChange={(e) => update({ passingScore: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[5rem_8rem_8rem_1fr_2.5rem] gap-3 px-1 text-xs font-semibold text-slate-gray uppercase tracking-wide">
              <span>Grade</span>
              <span>Min Score %</span>
              <span>Grade Point</span>
              <span>Remark</span>
              <span />
            </div>
            {form.gradeBands.map((band, index) => (
              <div
                key={index}
                className="grid grid-cols-2 sm:grid-cols-[5rem_8rem_8rem_1fr_2.5rem] gap-3 items-center bg-gray-50 rounded-lg p-3"
              >
                <Input
                  label={index === 0 ? "" : undefined}
                  aria-label="Grade"
                  name={`band-${index}-grade`}
                  value={band.grade}
                  onChange={(e) => setBand(index, "grade", e.target.value)}
                  placeholder="A"
                />
                <Input
                  aria-label="Minimum score"
                  name={`band-${index}-minScore`}
                  type="number"
                  min="0"
                  max="100"
                  value={band.minScore}
                  onChange={(e) => setBand(index, "minScore", e.target.value)}
                />
                <Input
                  aria-label="Grade point"
                  name={`band-${index}-gradePoint`}
                  type="number"
                  step="0.1"
                  min="0"
                  value={band.gradePoint}
                  onChange={(e) =>
                    setBand(index, "gradePoint", e.target.value)
                  }
                />
                <Input
                  aria-label="Remark"
                  name={`band-${index}-remark`}
                  value={band.remark}
                  onChange={(e) => setBand(index, "remark", e.target.value)}
                  placeholder="Excellent"
                />
                <button
                  type="button"
                  onClick={() => removeBand(index)}
                  className="justify-self-end text-danger hover:bg-red-50 p-2 rounded-lg transition-colors"
                  aria-label="Remove band"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Mark-entry score components (global, shared by every class/subject) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-primary">
              Mark Entry Columns
            </h2>
            <Button variant="outline" size="sm" icon={FaPlus} onClick={addComponent}>
              Add Column
            </Button>
          </div>
          <p className="text-xs text-slate-gray mb-4">
            These columns apply to every class and subject school-wide, so
            report cards stay consistent no matter who enters the scores.
            Turning a column off excludes it from the total but keeps any
            scores already entered — teachers still see it, but can no
            longer edit it.
          </p>

          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[1fr_8rem_6rem_2.5rem] gap-3 px-1 text-xs font-semibold text-slate-gray uppercase tracking-wide">
              <span>Label</span>
              <span>Max Marks</span>
              <span>Active</span>
              <span />
            </div>
            {form.scoreComponents.map((component, index) => (
              <div
                key={index}
                className="grid grid-cols-2 sm:grid-cols-[1fr_8rem_6rem_2.5rem] gap-3 items-center bg-gray-50 rounded-lg p-3"
              >
                <Input
                  aria-label="Column label"
                  name={`component-${index}-label`}
                  value={component.label}
                  onChange={(e) => setComponent(index, "label", e.target.value)}
                  placeholder="CA 1"
                />
                <Input
                  aria-label="Max marks"
                  name={`component-${index}-maxMarks`}
                  type="number"
                  min="0"
                  value={component.maxMarks}
                  onChange={(e) => setComponent(index, "maxMarks", e.target.value)}
                />
                <Toggle
                  enabled={component.isActive !== false}
                  onChange={(value) => setComponent(index, "isActive", value)}
                />
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  className="justify-self-end text-danger hover:bg-red-50 p-2 rounded-lg transition-colors"
                  aria-label="Remove column"
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
