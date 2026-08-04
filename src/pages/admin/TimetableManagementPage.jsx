import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

import timetableService from "../../services/timetableService";
import teacherAssignmentService from "../../services/teacherAssignmentService";
import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import TimetableGrid, { DAYS } from "../../components/TimetableGrid";
import FormModal from "../../components/modals/FormModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const dayOptions = DAYS.map((day) => ({ value: day, label: day }));

const emptyForm = {
  teacherAssignment: "",
  dayOfWeek: "Monday",
  startTime: "",
  endTime: "",
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function TimetableManagementPage() {
  const classesApi = useApi(classService.list);
  const assignmentsApi = useApi(teacherAssignmentService.list);

  const [classId, setClassId] = useState("");
  const [entries, setEntries] = useState(null);
  const [gridError, setGridError] = useState(null);
  const [loadingGrid, setLoadingGrid] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  const selectedClass = useMemo(
    () =>
      asArray(classesApi.data).find(
        (schoolClass) => schoolClass._id === classId,
      ) || null,
    [classesApi.data, classId],
  );

  // Only assignments for the selected class can be scheduled on its grid.
  const assignmentOptions = useMemo(
    () =>
      asArray(assignmentsApi.data)
        .filter((assignment) => {
          const assignmentClass =
            assignment.schoolClass?._id || assignment.schoolClass;
          return String(assignmentClass) === String(classId);
        })
        .map((assignment) => ({
          value: assignment._id,
          label: `${assignment.subject?.name || "Subject"} · ${
            displayName(assignment.teacher?.user || assignment.teacher) ||
            "Teacher"
          }`,
        })),
    [assignmentsApi.data, classId],
  );

  const loadGrid = async (targetClassId = classId) => {
    if (!targetClassId) return;
    setLoadingGrid(true);
    setGridError(null);
    try {
      const payload = await timetableService.forClass(targetClassId);
      setEntries(asArray(payload));
    } catch (err) {
      setGridError(err);
      setEntries(null);
    } finally {
      setLoadingGrid(false);
    }
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openCreate = () => {
    setSelected(null);
    setForm({
      ...emptyForm,
      teacherAssignment: assignmentOptions[0]?.value || "",
    });
    setFormOpen(true);
  };

  const openEdit = (entry) => {
    if (!classId) return;
    setSelected(entry);
    setForm({
      teacherAssignment:
        entry.teacherAssignment?._id || entry.teacherAssignment || "",
      dayOfWeek: entry.dayOfWeek || "Monday",
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
    });
    setFormOpen(true);
  };

  const validateForm = () => {
    if (!form.dayOfWeek) return "Pick a day of the week.";
    if (!timePattern.test(form.startTime) || !timePattern.test(form.endTime)) {
      return "Times must be in HH:MM format (e.g. 08:30).";
    }
    if (form.endTime <= form.startTime) {
      return "End time must be after the start time.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSaving(true);
    try {
      if (selected) {
        await timetableService.update(selected._id, {
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        toast.success("Period updated");
      } else {
        if (!form.teacherAssignment) {
          toast.error("Pick a class subject to schedule.");
          setSaving(false);
          return;
        }
        await timetableService.create({
          teacherAssignment: form.teacherAssignment,
          dayOfWeek: form.dayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
        });
        toast.success("Period added to the timetable");
      }
      setFormOpen(false);
      setSelected(null);
      loadGrid();
    } catch {
      // handled by the axios interceptor toast (e.g. scheduling clash)
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await timetableService.remove(selected._id);
      toast.success("Period removed");
      setDeleteOpen(false);
      setSelected(null);
      loadGrid();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setSaving(false);
    }
  };

  if (classesApi.loading || assignmentsApi.loading) {
    return <Loader text="Loading timetable data..." />;
  }
  if (classesApi.error || assignmentsApi.error) {
    return (
      <ErrorState
        onRetry={() => {
          classesApi.refetch();
          assignmentsApi.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle="Build the weekly period grid for each class"
        actions={
          classId && entries !== null ? (
            <Button icon={FaPlus} onClick={openCreate}>
              Add Period
            </Button>
          ) : null
        }
      />

      <Card className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end">
          <Select
            label="Class"
            name="class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setEntries(null);
              if (e.target.value) loadGrid(e.target.value);
            }}
            options={classOptions}
            placeholder={
              classOptions.length ? "Select a class" : "No classes yet"
            }
          />
          <div>
            <Button
              variant="outline"
              onClick={() => loadGrid()}
              disabled={!classId || loadingGrid}
              loading={loadingGrid}
            >
              Reload Grid
            </Button>
          </div>
        </div>
      </Card>

      {loadingGrid ? (
        <Loader text="Loading timetable..." />
      ) : gridError ? (
        <ErrorState onRetry={() => loadGrid()} />
      ) : entries === null ? (
        <EmptyState
          title="Select a class"
          description="Choose a class to view and manage its weekly timetable."
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title={`No periods for ${selectedClass ? classLabel(selectedClass) : "this class"}`}
          description="Add the first period: pick the class subject (teacher assignment), a day, and a time slot."
          actionLabel="Add Period"
          onAction={openCreate}
        />
      ) : (
        <>
          <p className="text-xs text-slate-gray mb-3">
            Click a period to edit its day or time, or remove it.
          </p>
          <TimetableGrid
            entries={entries}
            showTeacher
            showClass={false}
            onSelect={openEdit}
          />
        </>
      )}

      <FormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        title={selected ? "Edit Period" : "Add Period"}
        onSubmit={handleSubmit}
        loading={saving}
        maxWidth="md"
      >
        {!selected && (
          <Select
            label="Class Subject (teacher assignment)"
            name="teacherAssignment"
            value={form.teacherAssignment}
            onChange={set("teacherAssignment")}
            options={assignmentOptions}
            placeholder={
              assignmentOptions.length
                ? "Select class subject"
                : "No teacher assignments for this class"
            }
            required
          />
        )}
        <Select
          label="Day"
          name="dayOfWeek"
          value={form.dayOfWeek}
          onChange={set("dayOfWeek")}
          options={dayOptions}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Time"
            name="startTime"
            type="time"
            value={form.startTime}
            onChange={set("startTime")}
            required
          />
          <Input
            label="End Time"
            name="endTime"
            type="time"
            value={form.endTime}
            onChange={set("endTime")}
            required
          />
        </div>
        <p className="text-xs text-slate-gray">
          Scheduling clashes (same class, day and start time in the term) are
          rejected by the server.
        </p>
        {selected && (
          <div className="flex justify-start">
            <Button
              variant="danger"
              onClick={() => {
                setFormOpen(false);
                setDeleteOpen(true);
              }}
            >
              Remove Period
            </Button>
          </div>
        )}
      </FormModal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Remove Period"
        message={`Remove the ${selected?.dayOfWeek} ${selected?.startTime}–${selected?.endTime} period (${
          selected?.classSubject?.subject?.name || "subject"
        }) from this timetable?`}
      />
    </div>
  );
}
