import { useMemo, useState } from "react";

import assessmentService from "../../services/assessmentService";
import useApi from "../../hooks/useApi";
import useMyChildren from "../../hooks/useMyChildren";
import { asArray, classLabel } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";

// Parents have no dedicated assessments endpoint: GET /assessments is open to
// every authenticated role, so this page lists published assessments and
// keeps only those whose class matches one of the children's classes
// (classes are derived from the parent's role-scoped results feed).
export default function ChildAssessmentsPage() {
  const assessmentsApi = useApi(assessmentService.list);
  const { children, results } = useMyChildren();
  const [search, setSearch] = useState("");

  // Map of classId → child name(s) attending that class.
  const classMap = useMemo(() => {
    const map = new Map();
    results.forEach((result) => {
      const schoolClass = result.classSubject?.schoolClass;
      const classId = schoolClass?._id || schoolClass;
      if (!classId) return;
      const childName = children.find(
        (child) =>
          String(child.id) ===
          String(result.student?._id || result.student),
      )?.name;
      if (!childName) return;
      const entry = map.get(String(classId)) || {
        label: classLabel(schoolClass),
        children: new Set(),
      };
      entry.children.add(childName);
      map.set(String(classId), entry);
    });
    return map;
  }, [results, children]);

  const rows = asArray(assessmentsApi.data)
    .filter((assessment) => assessment.isPublished !== false)
    .filter((assessment) => {
      const classId =
        assessment.classSubject?.schoolClass?._id ||
        assessment.classSubject?.schoolClass;
      return classId && classMap.has(String(classId));
    })
    .map((assessment) => {
      const classId = String(
        assessment.classSubject?.schoolClass?._id ||
          assessment.classSubject?.schoolClass,
      );
      const entry = classMap.get(classId);
      return {
        _id: assessment._id,
        title: assessment.title || "—",
        type: assessment.type || "—",
        subject: assessment.classSubject?.subject?.name || "—",
        class: entry?.label || "—",
        child: entry ? Array.from(entry.children).join(", ") : "—",
        marks: assessment.totalMarks ?? "—",
        duration: assessment.duration ? `${assessment.duration} mins` : "—",
        opens: formatDate(assessment.availableFrom) || "—",
        closes: formatDate(assessment.availableTo) || "—",
        __search:
          `${assessment.title} ${assessment.type} ${assessment.classSubject?.subject?.name} ${entry?.label}`.toLowerCase(),
      };
    })
    .filter((row) => row.__search.includes(search.toLowerCase()));

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Type", accessor: "type" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Child", accessor: "child" },
    { header: "Marks", accessor: "marks" },
    { header: "Duration", accessor: "duration" },
    { header: "Opens", accessor: "opens" },
    { header: "Closes", accessor: "closes" },
  ];

  const loading = assessmentsApi.loading;
  const error = assessmentsApi.error;

  return (
    <ManagePage
      title="Child Assessments"
      subtitle="Published assessments for your children's classes"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search assessments..."
      columns={columns}
      rows={rows}
      loading={loading}
      error={error}
      onRetry={assessmentsApi.refetch}
      emptyTitle="No assessments found"
      emptyDescription="Assessments appear here once teachers publish them for your children's classes."
    />
  );
}
