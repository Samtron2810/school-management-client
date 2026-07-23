import { useEffect, useMemo, useState } from "react";

import teacherAssignmentService from "../../services/teacherAssignmentService";
import useMyTeaching from "../../hooks/useMyTeaching";
import { asArray, displayName } from "../../utils/apiData";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import DataTable from "../../components/tables/DataTable";
import SearchInput from "../../components/common/SearchInput";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/common/StatusBadge";

// Teacher roster: the real class roster for each of the teacher's
// assignments (GET /teacher-assignments/:id/students).
export default function StudentListPage() {
  const { assignments, loading, error, refetch } = useMyTeaching();

  const [assignmentId, setAssignmentId] = useState("");
  const [roster, setRoster] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");

  const assignmentOptions = assignments.map((assignment) => ({
    value: assignment.id,
    label: assignment.label,
  }));

  // Default to the first assignment once the teaching context arrives.
  useEffect(() => {
    if (!assignmentId && assignments.length > 0) {
      const id = assignments[0].id;
      const timer = setTimeout(() => setAssignmentId(id), 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [assignments, assignmentId]);

  useEffect(() => {
    if (!assignmentId) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setRosterLoading(true);
      setRosterError(null);
      try {
        const payload = await teacherAssignmentService.students(assignmentId);
        if (!cancelled) setRoster(asArray(payload));
      } catch (err) {
        if (!cancelled) {
          setRosterError(err);
          setRoster(null);
        }
      } finally {
        if (!cancelled) setRosterLoading(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [assignmentId, reloadKey]);

  const rows = useMemo(
    () =>
      (roster || []).map((entry) => {
        const student = entry.student || {};
        return {
          id: student._id || entry.student,
          name: displayName(student.user) || "Student",
          admissionNumber: student.admissionNumber || "—",
          gender: student.gender || "—",
          roll: entry.rollNumber ?? "—",
          status: student.isActive === false ? "inactive" : "active",
        };
      }),
    [roster],
  );

  const filtered = rows.filter((row) =>
    `${row.name} ${row.admissionNumber}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Student", accessor: "name" },
    { header: "Admission No.", accessor: "admissionNumber" },
    { header: "Gender", accessor: "gender" },
    { header: "Roll No.", accessor: "roll" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  if (loading) return <Loader text="Loading your classes..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="My Students"
        subtitle="Class rosters for your teacher assignments"
      />

      <Card className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Class Subject"
            name="assignment"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            options={assignmentOptions}
            placeholder={
              assignmentOptions.length
                ? "Select class subject"
                : "No assigned class subjects yet"
            }
          />
          <div className="flex items-end">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search students..."
              />
            </div>
          </div>
        </div>
      </Card>

      {rosterLoading ? (
        <Loader text="Loading roster..." />
      ) : rosterError ? (
        <ErrorState onRetry={() => setReloadKey((key) => key + 1)} />
      ) : roster === null ? (
        <EmptyState
          title="Select a class subject"
          description="Choose one of your assigned class subjects to view its roster."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No students on this roster"
          description="Active students enrolled in this class will appear here."
        />
      ) : (
        <DataTable columns={columns} data={filtered} pageSize={15} />
      )}
    </div>
  );
}
