import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";

import assessmentService from "../../services/assessmentService";
import studentAttemptService from "../../services/studentAttemptService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/ui/Tabs";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/common/StatusBadge";
import GradeBadge from "../../components/GradeBadge";

export default function MyAssessmentsPage() {
  const availableApi = useApi(assessmentService.available);
  const attemptsApi = useApi(studentAttemptService.list);
  const [availableSearch, setAvailableSearch] = useState("");
  const [attemptsSearch, setAttemptsSearch] = useState("");
  const navigate = useNavigate();

  const available = asArray(availableApi.data).map((assessment) => ({
    _id: assessment._id,
    title: assessment.title || "—",
    type: assessment.type || "—",
    subject: assessment.classSubject?.subject?.name || "—",
    class: classLabel(assessment.classSubject?.schoolClass),
    marks: assessment.totalMarks ?? "—",
    duration: assessment.duration ? `${assessment.duration} mins` : "—",
    closes: formatDate(assessment.availableTo),
    __search: `${assessment.title} ${assessment.type} ${assessment.classSubject?.subject?.name}`.toLowerCase(),
  }));

  const attempts = asArray(attemptsApi.data).map((attempt) => {
    const assessment = attempt.assessment || {};
    const percentage = attempt.percentage ?? (assessment.totalMarks ? Math.round(((attempt.score || 0) / assessment.totalMarks) * 100) : 0);
    return {
      _id: attempt._id,
      title: assessment.title || "—",
      type: assessment.type || "—",
      status: String(attempt.status || "").toLowerCase().replace(" ", "-"),
      score: attempt.score ?? "—",
      percentage: `${percentage}%`,
      grade: attempt.grade,
      date: formatDate(attempt.submittedAt || attempt.startedAt || attempt.createdAt),
      __doc: attempt,
      __search: `${assessment.title} ${assessment.type}`.toLowerCase(),
    };
  });

  const availableColumns = [
    { header: "Title", accessor: "title" },
    { header: "Type", accessor: "type" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Duration", accessor: "duration" },
    { header: "Closes", accessor: "closes" },
    {
      header: "Actions",
      render: (row) => (
        <Button size="sm" icon={FaPlay} onClick={() => navigate("/student/take-assessment", { state: { assessmentId: row._id } })}>
          Start
        </Button>
      ),
    },
  ];

  const attemptColumns = [
    { header: "Assessment", accessor: "title" },
    { header: "Type", accessor: "type" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status === "in-progress" ? "in-progress" : row.status === "auto-submitted" || row.status === "submitted" ? "submitted" : row.status} />,
    },
    { header: "Score", accessor: "score" },
    { header: "%", accessor: "percentage" },
    {
      header: "Grade",
      accessor: "grade",
      render: (row) => (row.grade ? <GradeBadge grade={row.grade} /> : "—"),
    },
    { header: "Date", accessor: "date" },
    {
      header: "Actions",
      render: (row) =>
        row.status === "in-progress" ? (
          <Button size="sm" variant="outline" onClick={() => navigate("/student/take-assessment", { state: { attemptId: row._id } })}>
            Resume
          </Button>
        ) : (
          <span className="text-xs text-slate-gray">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="My Assessments" subtitle="Take open assessments and review your past attempts" />
      <Tabs
      tabs={[
        {
          label: "Available",
          content: (
            <ManagePage
              hideHeader
              searchable
              searchValue={availableSearch}
              onSearchChange={setAvailableSearch}
              searchPlaceholder="Search available assessments..."
              columns={availableColumns}
              rows={available.filter((row) => row.__search.includes(availableSearch.toLowerCase()))}
              loading={availableApi.loading}
              error={availableApi.error}
              onRetry={availableApi.refetch}
              emptyTitle="No available assessments"
              emptyDescription="Assessments open to your class will appear here."
            />
          ),
        },
        {
          label: "My Attempts",
          content: (
            <ManagePage
              hideHeader
              searchable
              searchValue={attemptsSearch}
              onSearchChange={setAttemptsSearch}
              searchPlaceholder="Search your attempts..."
              columns={attemptColumns}
              rows={attempts.filter((row) => row.__search.includes(attemptsSearch.toLowerCase()))}
              loading={attemptsApi.loading}
              error={attemptsApi.error}
              onRetry={attemptsApi.refetch}
              emptyTitle="No attempts yet"
              emptyDescription="Your submitted assessments will appear here."
            />
          ),
        },
      ]}
      onChange={() => {}}
      />
    </div>
  );
}
