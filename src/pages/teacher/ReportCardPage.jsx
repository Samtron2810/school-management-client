import { useMemo, useState } from "react";

import resultService from "../../services/resultService";
import useApi from "../../hooks/useApi";
import useMyTeaching from "../../hooks/useMyTeaching";
import { asArray, displayName } from "../../utils/apiData";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ReportCardView from "../../components/ReportCardView";
import ClassReportCards from "../../components/ClassReportCards";

export default function TeacherReportCardPage() {
  const { data, loading, error, refetch } = useApi(resultService.list);
  const { assignments, loading: teachingLoading } = useMyTeaching();
  const [studentId, setStudentId] = useState("");
  const [card, setCard] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);

  const studentOptions = useMemo(() => {
    const map = new Map();
    asArray(data).forEach((result) => {
      const id = result.student?._id || result.student;
      if (id && !map.has(id)) {
        map.set(id, { value: id, label: displayName(result.student?.user) || "Student" });
      }
    });
    return Array.from(map.values());
  }, [data]);

  // One option per distinct class the teacher teaches (for bulk generation).
  const classOptions = useMemo(() => {
    const map = new Map();
    assignments.forEach((assignment) => {
      if (assignment.classId && !map.has(assignment.classId)) {
        map.set(assignment.classId, {
          value: assignment.classId,
          label: assignment.className,
        });
      }
    });
    return Array.from(map.values());
  }, [assignments]);

  const loadCard = async () => {
    if (!studentId) return;
    setCardLoading(true);
    try {
      const payload = await resultService.reportCard(studentId);
      setCard(payload);
    } catch {
      setCard(null);
    } finally {
      setCardLoading(false);
    }
  };

  if (loading || teachingLoading) return <Loader text="Loading..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Report Cards" subtitle="Generate term report cards for students you teach" />

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
              placeholder={studentOptions.length ? "Select a student" : "No students with results yet"}
            />
          </div>
          <Button onClick={loadCard} disabled={!studentId} loading={cardLoading}>
            Generate Report Card
          </Button>
        </div>
      </Card>

      {cardLoading ? (
        <Loader text="Building report card..." />
      ) : card ? (
        <Card>
          <ReportCardView card={card} />
        </Card>
      ) : (
        <EmptyState
          title="No report card selected"
          description="Pick a student above to generate their report card for the current session and term."
        />
      )}
    </div>
  );
}
