import { useMemo, useState } from "react";

import lessonService from "../../services/lessonService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import SearchInput from "../../components/common/SearchInput";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

// Parent view of published lessons across all their children's classes
// (GET /lessons/my is role-scoped for parents server-side).
export default function ChildLessonsPage() {
  const { data, loading, error, refetch } = useApi(lessonService.myLessons);
  const [search, setSearch] = useState("");

  const lessons = useMemo(
    () =>
      asArray(data).map((lesson) => ({
        _id: lesson._id,
        title: lesson.title || lesson.topic || "Lesson",
        subject:
          lesson.classSubject?.subject?.name ||
          lesson.teacherAssignment?.subject?.name ||
          "—",
        className: classLabel(
          lesson.classSubject?.schoolClass ||
            lesson.teacherAssignment?.schoolClass,
        ),
        teacher:
          displayName(
            lesson.teacherAssignment?.teacher?.user || lesson.teacher?.user,
          ) || "—",
        week: lesson.week ?? null,
        files: Array.isArray(lesson.files) ? lesson.files.length : 0,
        description: lesson.description || "",
      })),
    [data],
  );

  const filtered = lessons.filter((lesson) =>
    `${lesson.title} ${lesson.subject} ${lesson.className}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading) return <Loader text="Loading lessons..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Lessons"
        subtitle="Published lessons across your children's classes"
      />
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search lessons..."
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No lessons yet"
          description="Lessons published by your children's teachers will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lesson) => (
            <Card key={lesson._id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-primary">
                  {lesson.title}
                </h3>
                {lesson.week != null && (
                  <Badge variant="info">Week {lesson.week}</Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="primary">{lesson.subject}</Badge>
                <Badge variant="info">{lesson.className}</Badge>
              </div>
              <p className="text-sm text-slate-gray mt-3">
                Teacher: {lesson.teacher}
              </p>
              {lesson.description && (
                <p className="text-xs text-slate-gray mt-1 line-clamp-2">
                  {lesson.description}
                </p>
              )}
              {lesson.files > 0 && (
                <p className="text-xs text-royal-blue mt-2">
                  {lesson.files} attachment{lesson.files === 1 ? "" : "s"}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
