import { useState } from "react";

import useMyTeaching from "../../hooks/useMyTeaching";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";

export default function MySubjectsPage() {
  const { lessons, subjects, assignments, loading, error, refetch } = useMyTeaching();
  const [search, setSearch] = useState("");

  const rows = subjects
    .map((subject) => ({
      subject,
      classes: assignments.filter((a) => a.subject === subject).map((a) => a.className),
      lessons: lessons.filter(
        (lesson) => lesson.teacherAssignment?.subject?.name === subject,
      ).length,
    }))
    .filter((row) => row.subject.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader text="Loading your subjects..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="My Subjects" subtitle="Subjects you teach and the classes attached" />
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search subjects..." />
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No subjects yet"
          description="Your subjects appear once you have lessons. Ask an admin to assign you to class subjects."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((row) => (
            <Card key={row.subject}>
              <h3 className="text-lg font-semibold text-primary">{row.subject}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {row.classes.map((cls) => (
                  <Badge key={cls} variant="primary">{cls}</Badge>
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
