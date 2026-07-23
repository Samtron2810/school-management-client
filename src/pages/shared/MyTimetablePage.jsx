import timetableService from "../../services/timetableService";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import TimetableGrid from "../../components/TimetableGrid";

const subtitles = {
  teacher: "Your teaching periods for the current session and term",
  student: "Your class periods for the current session and term",
  parent: "Your children's class periods for the current session and term",
  admin: "All periods for the current session and term",
};

// Role-scoped weekly timetable (GET /timetables/my). Teachers see every
// class they teach; students their own class; parents the merged grid of
// their children's classes.
export default function MyTimetablePage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(timetableService.my);

  if (loading) return <Loader text="Loading timetable..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const entries = Array.isArray(data) ? data : [];
  const role = user?.role?.toLowerCase() || "student";

  return (
    <div>
      <PageHeader
        title="My Timetable"
        subtitle={subtitles[role] || subtitles.student}
      />
      {entries.length === 0 ? (
        <EmptyState
          title="No periods scheduled"
          description="A weekly timetable appears here once the school schedules periods for the current term."
        />
      ) : (
        <TimetableGrid
          entries={entries}
          showTeacher={role !== "teacher"}
          showClass={role === "teacher" || role === "parent" || role === "admin"}
        />
      )}
    </div>
  );
}
