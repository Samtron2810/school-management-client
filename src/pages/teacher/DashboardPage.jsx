import {
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaFileAlt,
  FaUserGraduate,
} from "react-icons/fa";

import dashboardService from "../../services/dashboardService";
import useApi from "../../hooks/useApi";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import StatCard from "../../components/dashboard/StatCard";
import Badge from "../../components/ui/Badge";
import ActivityPanels from "../../components/dashboard/ActivityPanels";

export default function TeacherDashboardPage() {
  const { data, loading, error, refetch } = useApi(
    dashboardService.getDashboard,
  );

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const summary = data?.summary || {};
  const context = data?.context || null;

  const stats = [
    {
      icon: FaChalkboardTeacher,
      title: "My Assignments",
      value: summary.teacherAssignments ?? 0,
    },
    {
      icon: FaClipboardCheck,
      title: "My Assessments",
      value: summary.assessments ?? 0,
    },
    { icon: FaFileAlt, title: "My Results", value: summary.results ?? 0 },
    {
      icon: FaUserGraduate,
      title: "Attempts (School)",
      value: summary.attempts ?? 0,
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Teacher Dashboard</h1>
          <p className="text-sm text-slate-gray mt-1">
            Your classes, assessments, and recent activity
          </p>
        </div>
        {context && (
          <Badge variant="info">
            {context.session?.name || "N/A"} · {context.term?.name || "N/A"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={String(stat.value)}
          />
        ))}
      </div>

      <ActivityPanels
        recentActivity={data?.recentActivity}
        resultsLink="/teacher/results"
        announcementsLink="/teacher/announcements"
      />
    </div>
  );
}
