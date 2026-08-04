import { useEffect, useState } from "react";

import attendanceService from "../../services/attendanceService";
import useMyEnrollment from "../../hooks/useMyEnrollment";
import { asArray } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import DataTable from "../../components/tables/DataTable";
import Badge from "../../components/ui/Badge";
import StatusBadge from "../../components/common/StatusBadge";

export default function AttendancePage() {
  const {
    studentId,
    loading: enrollmentLoading,
    error: enrollmentError,
    refetch,
  } = useMyEnrollment();
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    const load = async () => {
      setBusy(true);
      setLoadError(null);
      try {
        const [summaryPayload, historyPayload] = await Promise.all([
          attendanceService.summaryForStudent(studentId),
          attendanceService.forStudent(studentId),
        ]);
        if (cancelled) return;
        setSummary(summaryPayload);
        setRecords(asArray(historyPayload));
      } catch (err) {
        if (!cancelled) setLoadError(err);
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (enrollmentLoading) return <Loader text="Loading attendance..." />;
  if (enrollmentError) return <ErrorState onRetry={refetch} />;
  if (!studentId)
    return (
      <div>
        <PageHeader title="Attendance" subtitle="Your attendance record" />
        <EmptyState
          title="Not enrolled"
          description="Attendance unlocks once you're enrolled in a class for the current session and term."
        />
      </div>
    );
  if (busy) return <Loader text="Loading attendance..." />;
  if (loadError) return <ErrorState onRetry={() => window.location.reload()} />;

  const s = summary || {};
  const total =
    s.total ??
    s.totalRecords ??
    (s.present ?? 0) + (s.absent ?? 0) + (s.late ?? 0) + (s.excused ?? 0);
  const percentage =
    s.attendancePercentage ??
    (total > 0
      ? Math.round((((s.present ?? 0) + (s.late ?? 0)) / total) * 100)
      : 0);

  const columns = [
    { header: "Date", accessor: "date" },
    { header: "Class Subject", accessor: "subject" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: "Remark", accessor: "remark" },
  ];

  const rows = (records || []).map((record) => ({
    _id: record._id,
    date: formatDate(record.date),
    subject: record.classSubject?.subject?.name || "N/A",
    status: record.status,
    remark: record.remark || "N/A",
  }));

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Your attendance summary and history"
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <p className="text-sm text-slate-gray">Attendance Rate</p>
          <p className="text-2xl font-bold text-accent mt-1">{percentage}%</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-gray">Present</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {s.present ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-gray">Absent</p>
          <p className="text-2xl font-bold text-danger mt-1">{s.absent ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-gray">Late</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {s.late ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-gray">Excused</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {s.excused ?? 0}
          </p>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-primary">History</h2>
        <Badge variant="info">{rows.length} record(s)</Badge>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No attendance records"
          description="No attendance has been recorded for you yet."
        />
      ) : (
        <DataTable columns={columns} data={rows} pageSize={15} />
      )}
    </div>
  );
}
