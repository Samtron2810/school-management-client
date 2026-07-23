import { useState } from "react";
import toast from "react-hot-toast";

import attendanceService from "../../services/attendanceService";
import teacherAssignmentService from "../../services/teacherAssignmentService";
import useMyTeaching from "../../hooks/useMyTeaching";
import { asArray, displayName } from "../../utils/apiData";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import DataTable from "../../components/tables/DataTable";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/common/StatusBadge";

const statuses = ["Present", "Absent", "Late", "Excused"];

// Teacher attendance: view/correct saved records, or mark a fresh register
// straight from the class roster (GET /teacher-assignments/:id/students).
export default function AttendancePage() {
  const { assignments, loading, error, refetch } = useMyTeaching();

  const today = new Date().toISOString().slice(0, 10);
  const [assignmentId, setAssignmentId] = useState("");
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState(null); // null → nothing loaded
  const [mode, setMode] = useState(null); // "view" | "mark"
  const [busy, setBusy] = useState(false);
  const [edits, setEdits] = useState({});

  const assignmentOptions = assignments.map((assignment) => ({
    value: assignment.id,
    label: assignment.label,
  }));

  const resetBoard = () => {
    setRecords(null);
    setMode(null);
    setEdits({});
  };

  const loadForDate = async (
    targetAssignmentId = assignmentId,
    targetDate = date,
  ) => {
    if (!targetAssignmentId) return;
    setBusy(true);
    try {
      const payload = await attendanceService.byDate(targetAssignmentId, {
        date: targetDate,
      });
      setRecords(
        asArray(payload).map((record) => ({
          id: record._id,
          name:
            displayName(record.student?.user || record.student) || "Student",
          admissionNumber: record.student?.admissionNumber || "—",
          status: record.status,
          remark: record.remark || "—",
        })),
      );
      setMode("view");
      setEdits({});
    } catch {
      setRecords([]);
      setMode("view");
    } finally {
      setBusy(false);
    }
  };

  // Build an editable register from the class roster (all default "Present").
  const startMarking = async () => {
    if (!assignmentId) return;
    setBusy(true);
    try {
      const roster = await teacherAssignmentService.students(assignmentId);
      const entries = asArray(roster);
      setRecords(
        entries.map((entry) => {
          const student = entry.student || entry;
          return {
            studentId: student._id || entry.student,
            name: displayName(student.user) || "Student",
            admissionNumber: student.admissionNumber || "—",
            status: "Present",
          };
        }),
      );
      setMode("mark");
    } catch {
      setRecords(null);
    } finally {
      setBusy(false);
    }
  };

  const setRowStatus = (studentId, status) =>
    setRecords((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, status } : row)),
    );

  const submitAttendance = async () => {
    setBusy(true);
    try {
      await attendanceService.mark({
        teacherAssignment: assignmentId,
        date,
        records: records.map(({ studentId, status }) => ({
          student: studentId,
          status,
        })),
      });
      toast.success("Attendance saved");
      loadForDate();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (row) => {
    const status = edits[row.id];
    if (!status || status === row.status) return;
    try {
      await attendanceService.update(row.id, { status });
      toast.success(`Marked ${row.name} as ${status}`);
      loadForDate();
    } catch {
      // handled by the axios interceptor toast
    }
  };

  const viewColumns = [
    { header: "Student", accessor: "name" },
    { header: "Admission No.", accessor: "admissionNumber" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: "Remark", accessor: "remark" },
    {
      header: "Correct",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1">
          <select
            value={edits[row.id] || row.status}
            onChange={(e) =>
              setEdits((prev) => ({ ...prev, [row.id]: e.target.value }))
            }
            className="px-2 py-1 rounded border border-gray-200 text-xs focus:outline-none focus:border-royal-blue"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => saveEdit(row)}
            disabled={!edits[row.id] || edits[row.id] === row.status}
          >
            Save
          </Button>
        </div>
      ),
    },
  ];

  const markColumns = [
    { header: "Student", accessor: "name" },
    { header: "Admission No.", accessor: "admissionNumber" },
    {
      header: "Mark",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setRowStatus(row.studentId, status)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                row.status === status
                  ? "bg-royal-blue text-white"
                  : "bg-gray-100 text-slate-gray hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      ),
    },
  ];

  if (loading) return <Loader text="Loading attendance..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark the register or correct saved records for your class subjects"
      />

      <Card className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Class Subject"
            name="assignment"
            value={assignmentId}
            onChange={(e) => {
              setAssignmentId(e.target.value);
              resetBoard();
              if (e.target.value) loadForDate(e.target.value, date);
            }}
            options={assignmentOptions}
            placeholder={
              assignmentOptions.length
                ? "Select class subject"
                : "No assigned class subjects yet"
            }
          />
          <Input
            label="Date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex items-end gap-2">
            <Button
              onClick={() => loadForDate()}
              disabled={!assignmentId || busy}
              loading={busy}
            >
              Load Records
            </Button>
            <Button
              variant="outline"
              onClick={startMarking}
              disabled={!assignmentId || busy}
            >
              Mark Register
            </Button>
          </div>
        </div>
      </Card>

      {busy ? (
        <Loader text="Loading records..." />
      ) : mode === null ? (
        <EmptyState
          title="Select a class subject"
          description="Pick one of your assigned class subjects and a date to review attendance — or mark a fresh register from the class roster."
        />
      ) : records.length === 0 ? (
        <EmptyState
          title={
            mode === "mark"
              ? "No students on the roster"
              : "No records for this date"
          }
          description={
            mode === "mark"
              ? "No active students are enrolled in this class yet."
              : "Nothing has been recorded for this date yet — use 'Mark Register' to record it."
          }
          actionLabel={mode === "view" ? "Mark Register" : undefined}
          onAction={mode === "view" ? startMarking : undefined}
        />
      ) : (
        <>
          <DataTable
            columns={mode === "mark" ? markColumns : viewColumns}
            data={records}
            pageSize={25}
          />
          {mode === "mark" && (
            <div className="flex justify-end mt-4">
              <Button onClick={submitAttendance} loading={busy}>
                Save Attendance ({records.length} students)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
