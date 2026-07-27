import { useMemo } from "react";

import useMyTeaching from "../../hooks/useMyTeaching";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import ClassReportCards from "../../components/ClassReportCards";

export default function TeacherReportCardPage() {
  const { assignments, loading, error, refetch } = useMyTeaching();

  // One option per distinct class the teacher teaches.
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

  if (loading) return <Loader text="Loading..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Report Cards"
        subtitle="View, publish, and download report cards for classes you teach"
      />
      <ClassReportCards classOptions={classOptions} />
    </div>
  );
}
