import { useMemo } from "react";

import lessonService from "../../services/lessonService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

// Student class-subjects aren't directly exposed by the API (class-subjects
// is admin-only), so subjects are derived from the lessons published for
// the student's class — each lesson embeds its class-subject and teacher.
export default function MySubjectsPage() {
  const { data, loading, error, refetch } = useApi(lessonService.myLessons);

  const subjects = useMemo(() => {
    const map = new Map();
    asArray(data).forEach((lesson) => {
      const subject = lesson.teacherAssignment?.subject || lesson.classSubject?.subject;
      const name = subject?.name || lesson.classSubject?.name || "General";
      const entry = map.get(name) || {
        name,
        code: subject?.code || "—",
        teacher: displayName(lesson.teacherAssignment?.teacher?.user || lesson.teacher?.user) || "—",
        lessons: 0,
      };
      entry.lessons += 1;
      map.set(name, entry);
    });
    return Array.from(map.values());
  }, [data]);

  if (loading) return <Loader text="Loading your subjects..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="My Subjects" subtitle="Subjects with lessons available for your class" />
      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Subjects appear here once teachers publish lessons for your class."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card key={subject.name}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{subject.name}</h3>
                  <p className="text-xs text-slate-gray mt-0.5">{subject.code}</p>
                </div>
                <Badge variant="info">{subject.lessons} lesson{subject.lessons === 1 ? "" : "s"}</Badge>
              </div>
              <p className="text-sm text-slate-gray mt-3">Teacher: {subject.teacher}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
