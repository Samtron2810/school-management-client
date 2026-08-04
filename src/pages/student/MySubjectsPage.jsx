import { useMemo } from "react";

import classSubjectService from "../../services/classSubjectService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

// Student subjects come straight from GET /class-subjects/my — the real
// subject list for the student's current class (no lesson needed first).
export default function MySubjectsPage() {
  const { data, loading, error, refetch } = useApi(classSubjectService.my);

  const subjects = useMemo(
    () =>
      asArray(data).map((classSubject) => ({
        _id: classSubject._id,
        name: classSubject.subject?.name || "Subject",
        code: classSubject.subject?.code || "N/A",
        compulsory: classSubject.isCompulsory !== false,
        className: classLabel(classSubject.schoolClass),
      })),
    [data],
  );

  if (loading) return <Loader text="Loading your subjects..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const className = subjects[0]?.className;

  return (
    <div>
      <PageHeader
        title="My Subjects"
        subtitle={
          className && className !== "N/A"
            ? `Subjects registered for ${className} this term`
            : "Subjects registered for your class this term"
        }
      />
      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Your subjects appear here once the school registers subjects for your class."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card key={subject._id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-gray mt-0.5">
                    {subject.code}
                  </p>
                </div>
                <Badge variant={subject.compulsory ? "primary" : "info"}>
                  {subject.compulsory ? "Compulsory" : "Elective"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
