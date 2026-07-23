import { Link } from "react-router-dom";
import {
  FaUserGraduate,
  FaFileAlt,
  FaClipboardCheck,
  FaBullhorn,
} from "react-icons/fa";

import dashboardService from "../../services/dashboardService";
import useApi from "../../hooks/useApi";
import useMyChildren from "../../hooks/useMyChildren";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import ActivityPanels from "../../components/dashboard/ActivityPanels";

export default function ParentDashboardPage() {
  const { data, loading, error, refetch } = useApi(dashboardService.getDashboard);
  const { children } = useMyChildren();

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const summary = data?.summary || {};
  const context = data?.context || null;

  const stats = [
    {
      icon: FaUserGraduate,
      title: "My Children",
      value: summary.children ?? children.length,
    },
    {
      icon: FaClipboardCheck,
      title: "Children with Results",
      value: children.length,
    },
    {
      icon: FaFileAlt,
      title: "Results Recorded",
      value: children.reduce((total, child) => total + child.results, 0),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Parent Dashboard</h1>
          <p className="text-sm text-slate-gray mt-1">
            Track your children's progress at a glance
          </p>
        </div>
        {context && (
          <Badge variant="info">
            {context.session?.name || "—"} · {context.term?.name || "—"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={String(stat.value)}
          />
        ))}
      </div>

      {children.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-base font-semibold text-primary mb-4">
            Your Children
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <li
                key={child.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100"
              >
                <Avatar name={child.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {child.name}
                  </p>
                  <p className="text-xs text-slate-gray">
                    {child.className} · {child.results} result
                    {child.results === 1 ? "" : "s"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Link
          to="/parent/child-results"
          className="block p-5 rounded-xl bg-royal-blue text-white hover:bg-royal-blue/80 transition-colors"
        >
          <FaClipboardCheck className="text-2xl mb-2" />
          <p className="font-semibold">Results</p>
          <p className="text-sm text-white/80">See how your children scored</p>
        </Link>
        <Link
          to="/parent/child-report-cards"
          className="block p-5 rounded-xl bg-electric-blue text-white hover:opacity-90 transition-opacity"
        >
          <FaFileAlt className="text-2xl mb-2" />
          <p className="font-semibold">Report Cards</p>
          <p className="text-sm text-white/80">Term report cards</p>
        </Link>
        <Link
          to="/parent/child-attendance"
          className="block p-5 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity"
        >
          <FaBullhorn className="text-2xl mb-2" />
          <p className="font-semibold">Attendance</p>
          <p className="text-sm text-white/80">Daily attendance history</p>
        </Link>
      </div>

      <ActivityPanels
        recentActivity={data?.recentActivity}
        resultsLink="/parent/child-results"
        announcementsLink="/parent/announcements"
      />
    </div>
  );
}
