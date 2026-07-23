import { useState } from "react";
import { FaEye, FaPaperclip } from "react-icons/fa";

import lessonService from "../../services/lessonService";
import useApi from "../../hooks/useApi";
import { asArray, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

export default function MyLessonsPage() {
  const { data, loading, error, refetch } = useApi(lessonService.myLessons);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const rows = asArray(data).map((lesson) => ({
    _id: lesson._id,
    title: lesson.title || "—",
    topic: lesson.topic || "—",
    subject: lesson.teacherAssignment?.subject?.name || lesson.classSubject?.subject?.name || "—",
    teacher: displayName(lesson.teacherAssignment?.teacher?.user || lesson.teacher?.user) || "—",
    week: lesson.week || "—",
    date: formatDate(lesson.createdAt),
    __doc: lesson,
    __search: `${lesson.title} ${lesson.topic} ${lesson.teacherAssignment?.subject?.name}`.toLowerCase(),
  }));

  const filtered = rows.filter((row) => row.__search.includes(search.toLowerCase()));

  const openView = async (row) => {
    try {
      const detail = await lessonService.get(row._id);
      setSelected(detail);
    } catch {
      setSelected(row.__doc);
    }
    setViewOpen(true);
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Topic", accessor: "topic" },
    { header: "Subject", accessor: "subject" },
    { header: "Teacher", accessor: "teacher" },
    { header: "Week", accessor: "week" },
    { header: "Added", accessor: "date" },
    {
      header: "Actions",
      render: (row) => <Button variant="ghost" size="sm" icon={FaEye} onClick={() => openView(row)} />,
    },
  ];

  return (
    <>
      <ManagePage
        title="My Lessons"
        subtitle="Lessons published for your class"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search lessons..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No lessons yet"
        emptyDescription="Lessons will appear here when your teachers publish them."
      />

      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected?.title || "Lesson"} maxWidth="lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <Badge variant="info">
                {selected.teacherAssignment?.subject?.name || selected.classSubject?.subject?.name || "Subject"}
              </Badge>
              {selected.week && <Badge variant="primary">Week {selected.week}</Badge>}
            </div>
            <p className="font-medium text-primary">{selected.topic}</p>
            <p className="text-slate-gray whitespace-pre-line">{selected.description || "No description."}</p>
            {Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-gray mb-1 flex items-center gap-1">
                  <FaPaperclip /> Attachments
                </p>
                <ul className="space-y-1">
                  {selected.attachments.map((file) => (
                    <li key={file._id}>
                      <a
                        href={file.url || file.secure_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-royal-blue hover:underline text-sm"
                      >
                        {file.originalName || file.fileName || "Download attachment"}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
