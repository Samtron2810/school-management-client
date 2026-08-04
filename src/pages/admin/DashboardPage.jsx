import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserFriends,
  FaSchool,
  FaBook,
  FaClipboardList,
  FaFileAlt,
  FaUserCheck,
} from "react-icons/fa";

import dashboardService from "../../services/dashboardService";
import useApi from "../../hooks/useApi";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import StatCard from "../../components/dashboard/StatCard";

import Badge from "../../components/ui/Badge";
import ActivityPanels, {
  DistributionBars,
} from "../../components/dashboard/ActivityPanels";

export default function DashboardPage() {
  const { data, loading, error, refetch } = useApi(
    dashboardService.getDashboard,
  );

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const summary = data?.summary || {};
  const context = data?.context || null;
  const chartData = data?.chartData || {};

  const stats = [
    { icon: FaUserGraduate, title: "Students", value: summary.students ?? 0 },
    {
      icon: FaChalkboardTeacher,
      title: "Teachers",
      value: summary.teachers ?? 0,
    },
    { icon: FaUserFriends, title: "Parents", value: summary.parents ?? 0 },
    { icon: FaSchool, title: "Classes", value: summary.classes ?? 0 },
    { icon: FaBook, title: "Subjects", value: summary.subjects ?? 0 },
    {
      icon: FaUserCheck,
      title: "Enrollments",
      value: summary.enrollments ?? 0,
    },
    { icon: FaFileAlt, title: "Results", value: summary.results ?? 0 },
    {
      icon: FaClipboardList,
      title: "Assessments",
      value: summary.assessments ?? 0,
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-sm text-slate-gray mt-1">
            School overview and live statistics
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DistributionBars
          title="Grade Distribution"
          data={chartData.gradeDistribution}
        />
        <DistributionBars
          title="Attendance Distribution"
          data={chartData.attendanceDistribution}
        />
      </div>

      <ActivityPanels
        recentActivity={data?.recentActivity}
        resultsLink="/admin/reports"
        announcementsLink="/admin/announcements"
      />
    </div>
  );
}
