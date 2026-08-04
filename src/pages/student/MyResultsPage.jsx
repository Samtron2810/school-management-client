import { useState } from "react";

import resultService from "../../services/resultService";
import useApi from "../../hooks/useApi";
import { asArray } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import GradeBadge from "../../components/GradeBadge";

export default function MyResultsPage() {
  const { data, loading, error, refetch } = useApi(resultService.list);
  const [search, setSearch] = useState("");

  const rows = asArray(data).map((result) => ({
    _id: result._id,
    title: result.title || "N/A",
    subject:
      result.classSubject?.subject?.name ||
      result.metadata?.subjectName ||
      "N/A",
    type: result.type || "N/A",
    score: `${result.score ?? 0}/${result.totalMarks ?? 0}`,
    percentage: `${result.percentage ?? 0}%`,
    grade: result.grade,
    remark: result.remark || "N/A",
    date: formatDate(result.generatedAt || result.createdAt),
    __search:
      `${result.title} ${result.classSubject?.subject?.name} ${result.type}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) =>
    row.__search.includes(search.toLowerCase()),
  );

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    { header: "Type", accessor: "type" },
    { header: "Score", accessor: "score" },
    { header: "%", accessor: "percentage" },
    {
      header: "Grade",
      accessor: "grade",
      render: (row) => <GradeBadge grade={row.grade} />,
    },
    { header: "Remark", accessor: "remark" },
    { header: "Date", accessor: "date" },
  ];

  return (
    <ManagePage
      title="My Results"
      subtitle="Your recorded results across subjects"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search results..."
      columns={columns}
      rows={filtered}
      loading={loading}
      error={error}
      onRetry={refetch}
      emptyTitle="No results yet"
      emptyDescription="Your results will appear here once they are recorded."
    />
  );
}
