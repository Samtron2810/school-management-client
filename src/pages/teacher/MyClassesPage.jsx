import { useState } from "react";

import useMyTeaching from "../../hooks/useMyTeaching";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";

export default function MyClassesPage() {
  const { lessons, classes, assignments, loading, error, refetch } = useMyTeaching();
  const [search, setSearch] = useState("");

  const rows = classes
    .map((className) => ({
      className,
      subjects: assignments.filter((a) => a.className === className).map((a) => a.subject),
      lessons: lessons.filter(
        (lesson) =>
          lesson.teacherAssignment &&
          lesson.teacherAssignment.schoolClass &&
          `${lesson.teacherAssignment.schoolClass.className || ""} ${lesson.teacherAssignment.schoolClass.arm || ""}`.trim() === className,
      ).length,
    }))
    .filter((row) => row.className.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader text="Loading your classes..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="My Classes" subtitle="Classes you teach this session/term" />
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search classes..." />
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No classes yet"
          description="Your classes appear once you have lessons for a class subject. Ask an admin to assign you to class subjects."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => (
            <Card key={row.className}>
              <h3 className="text-lg font-semibold text-primary">{row.className}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {row.subjects.map((subject) => (
                  <Badge key={subject} variant="info">{subject}</Badge>
                ))}
              </div>
              <p className="text-sm text-slate-gray mt-3">{row.lessons} lesson{row.lessons === 1 ? "" : "s"} recorded</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
