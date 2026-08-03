import {
  FaSchool,
  FaClipboardCheck,
  FaFileAlt,
  FaBook,
} from "react-icons/fa";

import dashboardService from "../../services/dashboardService";
import lessonService from "../../services/lessonService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel } from "../../utils/apiData";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import StatCard from "../../components/dashboard/StatCard";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { Link } from "react-router-dom";
import ActivityPanels from "../../components/dashboard/ActivityPanels";

export default function StudentDashboardPage() {
  const { data, loading, error, refetch } = useApi(dashboardService.getDashboard);
  const lessonsApi = useApi(lessonService.myLessons);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const summary = data?.summary || {};
  const context = data?.context || null;
  const schoolClass = summary.enrollment?.schoolClass;
  const lessons = asArray(lessonsApi.data);

  const stats = [
    {
      icon: FaSchool,
      title: "My Class",
      value: schoolClass ? classLabel(schoolClass) : "Not enrolled",
    },
    { icon: FaFileAlt, title: "My Results", value: summary.results ?? 0 },
    { icon: FaClipboardCheck, title: "My Attempts", value: summary.attempts ?? 0 },
    { icon: FaBook, title: "Lessons Available", value: lessons.length },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Student Dashboard</h1>
          <p className="text-sm text-slate-gray mt-1">Your learning at a glance</p>
        </div>
        {context && (
          <Badge variant="info">
            {context.session?.name || "—"} · {context.term?.name || "—"}
          </Badge>
        )}
      </div>

      {!schoolClass && (
        <Card className="mb-6 border-l-4 border-accent">
          <p className="text-sm text-slate-gray">
            You are not enrolled in a class for the current session and term yet.
            Some features unlock once an admin enrolls you.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} icon={stat.icon} title={stat.title} value={String(stat.value)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Link to="/student/my-lessons" className="block p-5 rounded-xl bg-accent text-white hover:bg-accent/80 transition-colors">
          <FaBook className="text-2xl mb-2" />
          <p className="font-semibold">Read Lessons</p>
          <p className="text-sm text-white/80">Catch up on class lessons</p>
        </Link>
        <Link to="/student/my-assessments" className="block p-5 rounded-xl bg-accent text-white hover:opacity-90 transition-opacity">
          <FaClipboardCheck className="text-2xl mb-2" />
          <p className="font-semibold">Take Assessments</p>
          <p className="text-sm text-white/80">Quizzes, tests, and exams</p>
        </Link>
        <Link to="/student/report-cards" className="block p-5 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity">
          <FaFileAlt className="text-2xl mb-2" />
          <p className="font-semibold">Report Card</p>
          <p className="text-sm text-white/80">View your term report</p>
        </Link>
      </div>

      <ActivityPanels
        recentActivity={data?.recentActivity}
        resultsLink="/student/my-results"
        announcementsLink="/student/announcements"
      />
    </div>
  );
}
