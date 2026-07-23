import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import attendanceService from "../../services/attendanceService";
import teacherAssignmentService from "../../services/teacherAssignmentService";
import enrollmentService from "../../services/enrollmentService";
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
    const teacherName = displayName(assignment.teacher?.user || assignment.teacher) || "Teacher";
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
    const classId = selectedAssignment.schoolClass?._id || selectedAssignment.schoolClass;
    return asArray(enrollmentsApi.data)
      .filter((enrollment) => {
        const enrollmentClass = enrollment.schoolClass?._id || enrollment.schoolClass;
        return enrollmentClass === classId;
      })
      .map((enrollment) => ({
        studentId: enrollment.student?._id || enrollment.student,
        name: displayName(enrollment.student?.user || enrollment.student) || "Student",
        admissionNumber: enrollment.student?.admissionNumber || "—",
      }));
  }, [enrollmentsApi.data, selectedAssignment]);

  const loadForDate = async (targetAssignmentId = assignmentId, targetDate = date) => {
    if (!targetAssignmentId) return;
    setBusy(true);
    try {
      const payload = await attendanceService.byDate(targetAssignmentId, { date: targetDate });
      const existing = asArray(payload);
      setMarked(existing);
      setRecords(
        existing.map((record) => ({
          id: record._id,
          studentId: record.student?._id || record.student,
          name: displayName(record.student?.user || record.student) || "Student",
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
    setRecords((prev) => prev.map((row) => (row.studentId === studentId ? { ...row, status } : row)));

  const submitAttendance = async () => {
    setBusy(true);
    try {
      await attendanceService.mark({
        teacherAssignment: assignmentId,
        date,
        records: records.map(({ studentId, status }) => ({ student: studentId, status })),
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

  const loading = assignmentsApi.loading || enrollmentsApi.loading;
  const loadError = assignmentsApi.error || enrollmentsApi.error;

  if (loading) return <Loader text="Loading attendance..." />;
  if (loadError) return <ErrorState onRetry={() => { assignmentsApi.refetch(); enrollmentsApi.refetch(); }} />;

  return (
    <div>
      <PageHeader title="Attendance Overview" subtitle="Mark and review class attendance" />

      <Card className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Class Subject (teacher assignment)"
            name="assignment"
            value={assignmentId}
            onChange={(e) => {
              setAssignmentId(e.target.value);
              setRecords(null);
              setMarked(null);
              if (e.target.value) loadForDate(e.target.value, date);
            }}
            options={assignmentOptions}
            placeholder={assignmentOptions.length ? "Select class subject" : "No assignments yet"}
          />
          <Input label="Date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex items-end gap-2">
            <Button onClick={() => loadForDate()} disabled={!assignmentId || busy} loading={busy}>
              Load
            </Button>
            <Button variant="outline" onClick={startMarking} disabled={!assignmentId || roster.length === 0 || busy}>
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
    </div>
  );
}
