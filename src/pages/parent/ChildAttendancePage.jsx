import { useEffect, useState } from "react";

import attendanceService from "../../services/attendanceService";
import useMyChildren from "../../hooks/useMyChildren";
import { asArray } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import DataTable from "../../components/tables/DataTable";
import StatusBadge from "../../components/common/StatusBadge";

export default function ChildAttendancePage() {
  const { children, loading, error, refetch } = useMyChildren();
  const [childId, setChildId] = useState("");
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Default to the first child until the parent picks one explicitly.
  const effectiveChildId = childId || children[0]?.id || "";

  useEffect(() => {
    if (!effectiveChildId) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setLoadError(null);
      setSummary(null);
      setRecords(null);
      try {
        const [summaryPayload, historyPayload] = await Promise.all([
          attendanceService.summaryForStudent(effectiveChildId),
          attendanceService.forStudent(effectiveChildId),
        ]);
        if (cancelled) return;
        setSummary(summaryPayload);
        setRecords(asArray(historyPayload));
      } catch (err) {
        if (!cancelled) setLoadError(err);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveChildId, reloadKey]);

  if (loading) return <Loader text="Loading your children..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  if (children.length === 0) {
    return (
      <div>
        <PageHeader
          title="Child Attendance"
          subtitle="Attendance summary and history"
        />
        <EmptyState
          title="No children found"
          description="Attendance unlocks once your children are linked to your account and have school records."
        />
      </div>
    );
  }

  const selectedChild = children.find(
    (child) => String(child.id) === String(effectiveChildId),
  );
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

  const rows = (records || []).map((record) => ({
    _id: record._id,
    date: formatDate(record.date),
    subject: record.classSubject?.subject?.name || "—",
    status: record.status,
    remark: record.remark || "—",
  }));

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

  return (
    <div>
      <PageHeader
        title="Child Attendance"
        subtitle="Attendance summary and history"
      />

      <div className="w-full sm:w-72 mb-5">
        <Select
          label="Select Child"
          name="child"
          value={effectiveChildId}
          onChange={(event) => setChildId(event.target.value)}
          options={children.map((child) => ({
            value: child.id,
            label: child.name,
          }))}
          placeholder="Select a child"
        />
      </div>

      {busy ? (
        <Loader text="Loading attendance..." />
      ) : loadError ? (
        <ErrorState
          title="Attendance unavailable"
          description="Could not load attendance for this child right now."
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <p className="text-sm text-slate-gray">Attendance Rate</p>
              <p className="text-2xl font-bold text-royal-blue mt-1">
                {percentage}%
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-gray">Present</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {s.present ?? 0}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-gray">Absent</p>
              <p className="text-2xl font-bold text-crimson mt-1">
                {s.absent ?? 0}
              </p>
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
            <h2 className="text-lg font-semibold text-primary">
              History{selectedChild ? ` — ${selectedChild.name}` : ""}
            </h2>
            <Badge variant="info">{rows.length} record(s)</Badge>
          </div>
          {rows.length === 0 ? (
            <EmptyState
              title="No attendance records"
              description="No attendance has been recorded for this child yet."
            />
          ) : (
            <DataTable columns={columns} data={rows} pageSize={15} />
          )}
        </>
      )}
    </div>
  );
}
