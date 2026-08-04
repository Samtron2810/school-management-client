import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import attendanceService from "../../services/attendanceService";
import teacherAssignmentService from "../../services/teacherAssignmentService";
import enrollmentService from "../../services/enrollmentService";
import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import DataTable from "../../components/tables/DataTable";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Tabs from "../../components/ui/Tabs";
import StatusBadge from "../../components/common/StatusBadge";

const statuses = ["Present", "Absent", "Late", "Excused"];

export default function AttendanceOverviewPage() {
  const assignmentsApi = useApi(teacherAssignmentService.list);
  const enrollmentsApi = useApi(enrollmentService.list);

  const today = new Date().toISOString().slice(0, 10);
  const [assignmentId, setAssignmentId] = useState("");
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState(null);
  const [marked, setMarked] = useState(null);
  const [busy, setBusy] = useState(false);

  const assignments = asArray(assignmentsApi.data);
  const assignmentOptions = assignments.map((assignment) => {
    const rawTeacher = assignment.teacher?.user || assignment.teacher;
    const teacherName =
      typeof rawTeacher === "string"
        ? "Teacher"
        : displayName(rawTeacher) || "Teacher";
    return {
      value: assignment._id,
      label: `${classLabel(assignment.schoolClass)} · ${assignment.subject?.name || "Subject"} · ${teacherName}`,
    };
  });

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment._id === assignmentId),
    [assignments, assignmentId],
  );

  // Roster = students enrolled in the selected assignment's class
  const roster = useMemo(() => {
    if (!selectedAssignment) return [];
    const classId =
      selectedAssignment.schoolClass?._id || selectedAssignment.schoolClass;
    return asArray(enrollmentsApi.data)
      .filter((enrollment) => {
        const enrollmentClass =
          enrollment.schoolClass?._id || enrollment.schoolClass;
        return enrollmentClass === classId;
      })
      .map((enrollment) => ({
        studentId: enrollment.student?._id || enrollment.student,
        name:
          displayName(enrollment.student?.user || enrollment.student) ||
          "Student",
        admissionNumber: enrollment.student?.admissionNumber || "—",
      }));
  }, [enrollmentsApi.data, selectedAssignment]);

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
      const existing = asArray(payload);
      setMarked(existing);
      setRecords(
        existing.map((record) => ({
          id: record._id,
          studentId: record.student?._id || record.student,
          name:
            displayName(record.student?.user || record.student) || "Student",
          admissionNumber: record.student?.admissionNumber || "—",
          status: record.status,
        })),
      );
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setBusy(false);
    }
  };

  const startMarking = () => {
    setMarked(null);
    setRecords(
      roster.map((student) => ({
        studentId: student.studentId,
        name: student.name,
        admissionNumber: student.admissionNumber,
        status: "Present",
      })),
    );
  };

  const setRowStatus = (studentId, status) =>
    setRecords((prev) =>
      prev.map((row) =>
        row.studentId === studentId ? { ...row, status } : row,
      ),
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

  const columns = [
    { header: "Student", accessor: "name" },
    { header: "Admission No.", accessor: "admissionNumber" },
    {
      header: "Status",
      accessor: "status",
      render: (row) =>
        marked ? (
          <StatusBadge status={row.status} />
        ) : (
          <StatusBadge status={row.status} />
        ),
    },
    {
      header: marked ? "" : "Mark",
      render: (row) =>
        marked ? null : (
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setRowStatus(row.studentId, status)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  row.status === status
                    ? "bg-coral text-white"
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

  const loading = assignmentsApi.loading || enrollmentsApi.loading;
  const loadError = assignmentsApi.error || enrollmentsApi.error;

  if (loading) return <Loader text="Loading attendance..." />;
  if (loadError)
    return (
      <ErrorState
        onRetry={() => {
          assignmentsApi.refetch();
          enrollmentsApi.refetch();
        }}
      />
    );

  return (
    <div>
      <PageHeader
        title="Attendance Overview"
        subtitle="Mark per-subject attendance, view the class register, or summarize a date range"
      />

      <Tabs
        tabs={[
          {
            label: "Mark & Correct",
            content: (
              <PerSubjectView
                assignmentOptions={assignmentOptions}
                assignmentId={assignmentId}
                setAssignmentId={(id) => {
                  setAssignmentId(id);
                  setRecords(null);
                  setMarked(null);
                  if (id) loadForDate(id, date);
                }}
                date={date}
                setDate={setDate}
                loadForDate={loadForDate}
                startMarking={startMarking}
                busy={busy}
                records={records}
                roster={roster}
                marked={marked}
                columns={columns}
                submitAttendance={submitAttendance}
              />
            ),
          },
          { label: "Class Register", content: <ClassRegisterView /> },
          { label: "Class Summary", content: <ClassSummaryView /> },
        ]}
      />
    </div>
  );
}

// The existing per-subject marking flow (teacher assignment based).
function PerSubjectView({
  assignmentOptions,
  assignmentId,
  setAssignmentId,
  date,
  setDate,
  loadForDate,
  startMarking,
  busy,
  records,
  roster,
  marked,
  columns,
  submitAttendance,
}) {
  return (
    <>
      <Card className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Class Subject (teacher assignment)"
            name="assignment"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            options={assignmentOptions}
            placeholder={
              assignmentOptions.length
                ? "Select class subject"
                : "No assignments yet"
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
              Load
            </Button>
            <Button
              variant="outline"
              onClick={startMarking}
              disabled={!assignmentId || roster.length === 0 || busy}
            >
              Mark Attendance
            </Button>
          </div>
        </div>
      </Card>

      {busy ? (
        <Loader text="Loading records..." />
      ) : records === null ? (
        <EmptyState
          title="Select a class subject"
          description="Choose a teacher assignment and a date to view or mark attendance."
        />
      ) : records.length === 0 && roster.length === 0 ? (
        <EmptyState
          title="No students in this class"
          description="No students are enrolled in this class yet (check Enrollments)."
        />
      ) : records.length === 0 ? (
        <EmptyState
          title="Nothing recorded"
          description="No attendance has been recorded for this date. Use 'Mark Attendance' to record it."
          actionLabel="Mark Attendance"
          onAction={startMarking}
        />
      ) : (
        <>
          <DataTable columns={columns} data={records} pageSize={25} />
          {!marked && (
            <div className="flex justify-end mt-4">
              <Button onClick={submitAttendance} loading={busy}>
                Save Attendance ({records.length} students)
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// Whole-class daily register (GET /attendance/register?schoolClass=&date=) —
// one row per enrolled student; students with no record show as unmarked.
function ClassRegisterView() {
  const classesApi = useApi(classService.list);
  const today = new Date().toISOString().slice(0, 10);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  const load = async (targetClassId = classId, targetDate = date) => {
    if (!targetClassId) return;
    setBusy(true);
    try {
      const payload = await attendanceService.register({
        schoolClass: targetClassId,
        date: targetDate,
      });
      setRows(
        asArray(payload).map((record) => ({
          id:
            record._id ||
            record.student?._id ||
            record.student ||
            `${targetDate}-${displayName(record.student?.user)}`,
          student: displayName(record.student?.user) || "Student",
          admissionNumber: record.student?.admissionNumber || "—",
          status: record.status,
          remark: record.remark || "—",
        })),
      );
    } catch {
      setRows([]);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Admission No.", accessor: "admissionNumber" },
    {
      header: "Status",
      accessor: "status",
      render: (row) =>
        row.status ? (
          <StatusBadge status={row.status} />
        ) : (
          <span className="text-xs text-slate-gray">Not marked</span>
        ),
    },
    { header: "Remark", accessor: "remark" },
  ];

  if (classesApi.loading) return <Loader text="Loading classes..." />;
  if (classesApi.error) return <ErrorState onRetry={classesApi.refetch} />;

  return (
    <>
      <Card className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Class"
            name="register-class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setRows(null);
              if (e.target.value) load(e.target.value, date);
            }}
            options={classOptions}
            placeholder={
              classOptions.length ? "Select a class" : "No classes yet"
            }
          />
          <Input
            label="Date"
            name="register-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              onClick={() => load()}
              disabled={!classId || busy}
              loading={busy}
            >
              Load Register
            </Button>
          </div>
        </div>
      </Card>

      {busy ? (
        <Loader text="Loading register..." />
      ) : rows === null ? (
        <EmptyState
          title="Select a class"
          description="Pick a class and a date to see the whole-class register for that day."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No register entries"
          description="No students are enrolled in this class, or nothing was recorded on this date."
        />
      ) : (
        <DataTable columns={columns} data={rows} pageSize={25} />
      )}
    </>
  );
}

// Whole-class attendance totals over a date range
// (GET /attendance/summary?schoolClass=&from=&to=).
function ClassSummaryView() {
  const classesApi = useApi(classService.list);
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .slice(0, 10);
  const [classId, setClassId] = useState("");
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);

  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  const load = async (targetClassId = classId) => {
    if (!targetClassId) return;
    setBusy(true);
    try {
      const payload = await attendanceService.classSummary({
        schoolClass: targetClassId,
        from,
        to,
      });
      setRows(
        asArray(payload).map((entry, index) => ({
          id: entry.student?._id || entry.student || index,
          student: displayName(entry.student?.user) || "Student",
          admissionNumber: entry.student?.admissionNumber || "—",
          present: entry.present ?? entry.totals?.Present ?? 0,
          absent: entry.absent ?? entry.totals?.Absent ?? 0,
          late: entry.late ?? entry.totals?.Late ?? 0,
          excused: entry.excused ?? entry.totals?.Excused ?? 0,
          percentage:
            entry.attendancePercentage != null
              ? `${entry.attendancePercentage}%`
              : "—",
        })),
      );
    } catch {
      setRows([]);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Admission No.", accessor: "admissionNumber" },
    { header: "Present", accessor: "present" },
    { header: "Absent", accessor: "absent" },
    { header: "Late", accessor: "late" },
    { header: "Excused", accessor: "excused" },
    {
      header: "Attendance %",
      accessor: "percentage",
      render: (row) => (
        <span
          className={`text-xs font-semibold ${
            parseInt(row.percentage, 10) >= 75
              ? "text-green-600"
              : "text-danger"
          }`}
        >
          {row.percentage}
        </span>
      ),
    },
  ];

  if (classesApi.loading) return <Loader text="Loading classes..." />;
  if (classesApi.error) return <ErrorState onRetry={classesApi.refetch} />;

  return (
    <>
      <Card className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Class"
            name="summary-class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setRows(null);
              if (e.target.value) load(e.target.value);
            }}
            options={classOptions}
            placeholder={
              classOptions.length ? "Select a class" : "No classes yet"
            }
          />
          <Input
            label="From"
            name="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To"
            name="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <div className="flex items-end">
            <Button
              onClick={() => load()}
              disabled={!classId || busy}
              loading={busy}
            >
              Load Summary
            </Button>
          </div>
        </div>
      </Card>

      {busy ? (
        <Loader text="Loading summary..." />
      ) : rows === null ? (
        <EmptyState
          title="Select a class"
          description="Pick a class and a date range to see per-student attendance totals."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No attendance in this range"
          description="No attendance has been recorded for this class within the selected dates."
        />
      ) : (
        <DataTable columns={columns} data={rows} pageSize={25} />
      )}
    </>
  );
}
