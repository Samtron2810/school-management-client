import { Link } from "react-router-dom";
import { FaBullhorn, FaClipboardList } from "react-icons/fa";

import { asArray, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import GradeBadge from "../GradeBadge";

// Shared dashboard panels fed by GET /dashboard's recentActivity payload:
// { announcements: [], results: [], attempts: [], assessments: [] }
export default function ActivityPanels({ recentActivity, resultsLink, announcementsLink }) {
  const results = asArray(recentActivity?.results);
  const announcements = asArray(recentActivity?.announcements);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-primary">Recent Results</h3>
          {resultsLink && (
            <Link to={resultsLink} className="text-xs text-royal-blue hover:underline">
              View all
            </Link>
          )}
        </div>
        {results.length === 0 ? (
          <p className="text-sm text-slate-gray text-center py-6">No results yet</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.slice(0, 5).map((result) => (
              <li key={result._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {displayName(result.student?.user) || "Student"} · {result.classSubject?.subject?.name || result.title || "Result"}
                  </p>
                  <p className="text-xs text-slate-gray">
                    {result.score ?? 0}/{result.totalMarks ?? 0} ({result.percentage ?? 0}%) · {formatDate(result.generatedAt || result.createdAt)}
                  </p>
                </div>
                <GradeBadge grade={result.grade} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padding={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-primary">Latest Announcements</h3>
          {announcementsLink && (
            <Link to={announcementsLink} className="text-xs text-royal-blue hover:underline">
              View all
            </Link>
          )}
        </div>
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-gray text-center py-6">No announcements</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {announcements.slice(0, 5).map((announcement) => (
              <li key={announcement._id} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <FaBullhorn className="text-royal-blue text-xs shrink-0" />
                  <p className="text-sm font-medium text-primary">{announcement.title}</p>
                  {announcement.priority && announcement.priority !== "Normal" && (
                    <Badge variant={announcement.priority === "Urgent" ? "danger" : "warning"}>
                      {announcement.priority}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-gray mt-1 ml-5 line-clamp-1">{announcement.message}</p>
                <p className="text-xs text-slate-gray mt-0.5 ml-5">{formatDate(announcement.publishAt || announcement.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// Horizontal bar breakdown for grade/attendance distributions
export function DistributionBars({ title, data = {}, icon: Icon = FaClipboardList }) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);

  return (
    <Card>
      <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
        <Icon className="text-royal-blue" /> {title}
      </h3>
      {entries.length === 0 || total === 0 ? (
        <p className="text-sm text-slate-gray">No data yet</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(([label, value]) => {
            const pct = total === 0 ? 0 : Math.round((Number(value) / total) * 100);
            return (
              <li key={label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-gray">{label}</span>
                  <span className="font-medium text-primary">
                    {value} ({pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-royal-blue transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
