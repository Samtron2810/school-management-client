import { useState } from "react";
import toast from "react-hot-toast";

import resultService from "../../services/resultService";
import studentService from "../../services/studentService";
import classService from "../../services/classService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import DataTable from "../../components/tables/DataTable";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import GradeBadge from "../../components/GradeBadge";
import ReportCardView from "../../components/ReportCardView";
import ClassReportCards from "../../components/ClassReportCards";

export default function ReportCardPage() {
  const resultsApi = useApi(resultService.list);
  const studentsApi = useApi(studentService.list);
  const classesApi = useApi(classService.list);

  const [studentId, setStudentId] = useState("");
  const [card, setCard] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);

  const results = asArray(resultsApi.data);
  const studentOptions = asArray(studentsApi.data).map((student) => ({
    value: student._id,
    label: `${displayName(student.user || student)}${student.admissionNumber ? ` (${student.admissionNumber})` : ""}`,
  }));
  const classOptions = asArray(classesApi.data).map((schoolClass) => ({
    value: schoolClass._id,
    label: classLabel(schoolClass),
  }));

  const loadCard = async (targetId) => {
    if (!targetId) return;
    setCardLoading(true);
    try {
      const payload = await resultService.reportCard(targetId);
      setCard(payload);
    } catch {
      setCard(null);
      toast.error("Could not generate the report card");
    } finally {
      setCardLoading(false);
    }
  };

  const resultColumns = [
    {
      header: "Student",
      accessor: "student",
      render: (row) => row.__name,
    },
    { header: "Subject", accessor: "subject" },
    { header: "Score", accessor: "score" },
    {
      header: "Grade",
      accessor: "grade",
      render: (row) => <GradeBadge grade={row.grade} />,
    },
    { header: "Term", accessor: "term" },
  ];

  const resultRows = results.map((result) => ({
    ...result,
    __name: displayName(result.student?.user) || "—",
    subject: result.classSubject?.subject?.name || result.title || "—",
    score: `${result.score ?? 0}/${result.totalMarks ?? 0} (${result.percentage ?? 0}%)`,
    term: result.term?.name || "—",
  }));

  if (resultsApi.loading || studentsApi.loading || classesApi.loading) {
    return <Loader text="Loading results..." />;
  }
  if (resultsApi.error) return <ErrorState onRetry={resultsApi.refetch} />;

  return (
    <div>
      <PageHeader
        title="Report Cards"
        subtitle="Generate term report cards and review all recorded results"
      />

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <Select
              label="Student"
              name="student"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setCard(null);
              }}
              options={studentOptions}
              placeholder="Select a student"
            />
          </div>
          <Button onClick={() => loadCard(studentId)} disabled={!studentId} loading={cardLoading}>
            Generate Report Card
          </Button>
        </div>
      </Card>

      {cardLoading ? (
        <Loader text="Building report card..." />
      ) : card ? (
        <Card className="mb-6">
          <ReportCardView card={card} />
        </Card>
      ) : (
        <EmptyState
          title="No report card selected"
          description="Pick a student above to generate their report card."
        />
      )}

      <ClassReportCards classOptions={classOptions} />

      <h2 className="text-lg font-semibold text-primary mt-8 mb-4">All Results</h2>
      {resultRows.length === 0 ? (
        <EmptyState title="No results recorded" description="Results recorded by teachers will appear here." />
      ) : (
        <DataTable columns={resultColumns} data={resultRows} pageSize={15} />
      )}
    </div>
  );
}
