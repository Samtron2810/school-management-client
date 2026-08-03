import { useMemo, useState } from "react";
import { FaBullhorn, FaThumbtack } from "react-icons/fa";

import announcementService from "../../services/announcementService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Loader from "../../components/common/Loader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";

const priorityVariant = {
  Urgent: "danger",
  High: "warning",
  Normal: "info",
  Low: "default",
};

export default function AnnouncementsPage() {
  const { data, loading, error, refetch } = useApi(announcementService.list);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const announcements = useMemo(() => {
    const term = search.toLowerCase();
    return asArray(data)
      .filter(
        (announcement) =>
          announcement.title?.toLowerCase().includes(term) ||
          announcement.message?.toLowerCase().includes(term),
      )
      .sort((a, b) => {
        // Pinned first, then newest publish date.
        if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
          return a.isPinned ? -1 : 1;
        }
        const dateA = new Date(a.publishAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [data, search]);

  let content;
  if (loading) {
    content = <Loader text="Loading announcements..." />;
  } else if (error) {
    content = <ErrorState onRetry={refetch} />;
  } else if (announcements.length === 0) {
    content = (
      <EmptyState
        title={asArray(data).length === 0 ? "No announcements" : "No matches"}
        description={
          asArray(data).length === 0
            ? "Announcements from the school will appear here."
            : "Try a different search term."
        }
      />
    );
  } else {
    content = (
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {announcements.map((announcement) => (
          <li key={announcement._id}>
            <button
              onClick={() => setSelected(announcement)}
              className="w-full text-left"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {announcement.isPinned ? (
                      <FaThumbtack className="text-yellow-600 shrink-0" />
                    ) : (
                      <FaBullhorn className="text-accent shrink-0" />
                    )}
                    <h3 className="text-base font-semibold text-primary truncate">
                      {announcement.title}
                    </h3>
                  </div>
                  <Badge
                    variant={priorityVariant[announcement.priority] || "info"}
                  >
                    {announcement.priority || "Normal"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-gray line-clamp-2 mb-3">
                  {announcement.message}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-gray">
                  <span>
                    {formatDate(announcement.publishAt || announcement.createdAt)}
                  </span>
                  {announcement.expiresAt && (
                    <span>· until {formatDate(announcement.expiresAt)}</span>
                  )}
                  {(announcement.targetRoles || []).map((roleName) => (
                    <Badge
                      key={roleName}
                      variant="default"
                      className="capitalize"
                    >
                      {roleName}
                    </Badge>
                  ))}
                </div>
              </Card>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="School-wide and class announcements"
      />
      <div className="mb-4 max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search announcements..."
        />
      </div>
      {content}

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || "Announcement"}
        maxWidth="lg"
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={priorityVariant[selected.priority] || "info"}>
                {selected.priority || "Normal"}
              </Badge>
              {selected.isPinned && <Badge variant="warning">Pinned</Badge>}
              {(selected.targetRoles || []).map((roleName) => (
                <Badge key={roleName} variant="default" className="capitalize">
                  {roleName}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-primary whitespace-pre-line">
              {selected.message}
            </p>
            <div className="text-xs text-slate-gray pt-2 border-t border-gray-100 space-y-1">
              <p>
                Published {formatDate(selected.publishAt || selected.createdAt)}
                {selected.expiresAt
                  ? ` · Expires ${formatDate(selected.expiresAt)}`
                  : ""}
              </p>
              <p>{displayName(selected.createdBy) || "School administration"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
