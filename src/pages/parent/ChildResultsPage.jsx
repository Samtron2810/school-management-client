import { useState } from "react";

import useMyChildren from "../../hooks/useMyChildren";
import { displayName, classLabel } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import Select from "../../components/ui/Select";
import GradeBadge from "../../components/GradeBadge";

export default function ChildResultsPage() {
  const { children, results, loading, error, refetch } = useMyChildren();
  const [childId, setChildId] = useState("");
  const [search, setSearch] = useState("");

  const childOptions = [
    { value: "", label: "All children" },
    ...children.map((child) => ({ value: child.id, label: child.name })),
  ];

  const rows = results
    .filter((result) => {
      if (!childId) return true;
      const id = result.student?._id || result.student;
      return String(id) === String(childId);
    })
    .map((result) => ({
      _id: result._id,
      child: displayName(result.student?.user) || "Child",
      title: result.title || "—",
      subject: result.classSubject?.subject?.name || "—",
      type: result.type || "—",
      class: classLabel(result.classSubject?.schoolClass),
      score: `${result.score ?? 0}/${result.totalMarks ?? 0}`,
      percentage: `${result.percentage ?? 0}%`,
      grade: result.grade,
      remark: result.remark || "—",
      date: formatDate(result.generatedAt || result.createdAt),
      __search: `${displayName(result.student?.user)} ${result.title} ${result.classSubject?.subject?.name} ${result.type}`.toLowerCase(),
    }))
    .filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Child", accessor: "child" },
    { header: "Title", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    { header: "Type", accessor: "type" },
    { header: "Class", accessor: "class" },
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
      title="Child Results"
      subtitle="Your children's recorded results"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search results..."
      toolbar={
        <div className="w-full sm:w-56">
          <Select
            name="child"
            value={childId}
            onChange={(event) => setChildId(event.target.value)}
            options={childOptions}
            placeholder="All children"
          />
        </div>
      }
      columns={columns}
      rows={rows}
      loading={loading}
      error={error}
      onRetry={refetch}
      emptyTitle="No results yet"
      emptyDescription="Results recorded for your children will appear here."
    />
  );
}
