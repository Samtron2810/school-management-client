import { useMemo, useState } from "react";

import resultService from "../../services/resultService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";

import ManagePage from "../../components/ManagePage";
import GradeBadge from "../../components/GradeBadge";
import Badge from "../../components/ui/Badge";

// The API has no teacher-scoped roster endpoint (GET /students is admin-only),
// so this roster is derived from the teacher's own results feed — every
// student who has at least one result recorded by/for this teacher.
export default function StudentListPage() {
  const { data, loading, error, refetch } = useApi(resultService.list);
  const [search, setSearch] = useState("");

  const students = useMemo(() => {
    const map = new Map();
    asArray(data).forEach((result) => {
      const id = result.student?._id || result.student;
      if (!id) return;
      const entry = map.get(id) || {
        id,
        name: displayName(result.student?.user) || "Student",
        admissionNumber: result.student?.admissionNumber || "—",
        results: 0,
        latestGrade: result.grade,
      };
      entry.results += 1;
      entry.latestGrade = result.grade;
      map.set(id, entry);
    });
    return Array.from(map.values());
  }, [data]);

  const filtered = students.filter((student) =>
    `${student.name} ${student.admissionNumber}`.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Student", accessor: "name" },
    { header: "Admission No.", accessor: "admissionNumber" },
    {
      header: "Results",
      accessor: "results",
      render: (row) => <Badge variant="info">{row.results} recorded</Badge>,
    },
    {
      header: "Latest Grade",
      accessor: "latestGrade",
      render: (row) => <GradeBadge grade={row.latestGrade} />,
    },
  ];

  return (
    <ManagePage
      title="My Students"
      subtitle="Students with recorded results for your subjects (full rosters are managed by admins)"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search students..."
      columns={columns}
      rows={filtered}
      loading={loading}
      error={error}
      onRetry={refetch}
      emptyTitle="No students yet"
      emptyDescription="Students appear here once they have results for your subjects."
    />
  );
}
