import { useState } from "react";
import toast from "react-hot-toast";

import attendanceService from "../../services/attendanceService";
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

export default function AttendancePage() {
  const { assignments, loading, error, refetch } = useMyTeaching();

  const today = new Date().toISOString().slice(0, 10);
  const [assignmentId, setAssignmentId] = useState("");
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState(null);
  const [busy, setBusy] = useState(false);
  const [edits, setEdits] = useState({});

  const assignmentOptions = assignments.map((assignment) => ({
    value: assignment.id,
    label: assignment.label,
  }));

  const load = async (targetAssignmentId = assignmentId, targetDate = date) => {
    if (!targetAssignmentId) return;
    setBusy(true);
    try {
      const payload = await attendanceService.byDate(targetAssignmentId, { date: targetDate });
      setRecords(
        asArray(payload).map((record) => ({
          id: record._id,
          name: displayName(record.student?.user || record.student) || "Student",
          admissionNumber: record.student?.admissionNumber || "—",
          status: record.status,
          remark: record.remark || "—",
        })),
      );
      setEdits({});
    } catch {
      setRecords([]);
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
      load();
    } catch {
      // handled by the axios interceptor toast
    }
  };

  const columns = [
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
            onChange={(e) => setEdits((prev) => ({ ...prev, [row.id]: e.target.value }))}
            className="px-2 py-1 rounded border border-gray-200 text-xs focus:outline-none focus:border-royal-blue"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => saveEdit(row)} disabled={!edits[row.id] || edits[row.id] === row.status}>
            Save
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader text="Loading attendance..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Attendance" subtitle="View and correct attendance for your class subjects" />

      <Card className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Class Subject"
            name="assignment"
            value={assignmentId}
            onChange={(e) => {
              setAssignmentId(e.target.value);
              setRecords(null);
              if (e.target.value) load(e.target.value, date);
            }}
            options={assignmentOptions}
            placeholder={assignmentOptions.length ? "Select class subject" : "No assigned class subjects yet"}
          />
          <Input label="Date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="flex items-end">
            <Button onClick={() => load()} disabled={!assignmentId || busy} loading={busy}>
              Load Records
            </Button>
          </div>
        </div>
      </Card>

      {busy ? (
        <Loader text="Loading records..." />
      ) : records === null ? (
        <EmptyState
          title="Select a class subject"
          description="Pick one of your assigned class subjects and a date to review attendance."
        />
      ) : records.length === 0 ? (
        <EmptyState
          title="No records for this date"
          description="Attendance is first captured from the admin attendance desk (roster access is admin-scoped), then you can correct statuses here."
        />
      ) : (
        <DataTable columns={columns} data={records} pageSize={25} />
      )}
    </div>
  );
}
