import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FaBan, FaCheckCircle, FaEye, FaTrashAlt } from "react-icons/fa";

import assessmentService from "../../services/assessmentService";
import adminService from "../../services/adminService";
import useApi from "../../hooks/useApi";
import { asArray, classLabel, displayName } from "../../utils/apiData";
import formatDate from "../../utils/formatDate";

import ManagePage from "../../components/ManagePage";
import Modal from "../../components/ui/Modal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import StatusBadge from "../../components/common/StatusBadge";

export default function AssessmentManagementPage() {
  const { data, loading, error, refetch } = useApi(assessmentService.list);
  const { data: usersData } = useApi(adminService.getUsers, []);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const rows = asArray(data).map((assessment) => {
    const classSubject = assessment.classSubject || {};
    const usersMap = {}; // lightweight per-row map fallback
    // build usersMap from usersData if available
    if (Array.isArray(usersData)) {
      usersData.forEach((u) => {
        const id = u._id || u.id;
        if (id) usersMap[id] = u;
      });
    }

    const rawTeacher = assessment.teacher?.user || assessment.teacher;
    let teacherName = displayName(rawTeacher);
    if ((!teacherName || typeof rawTeacher === "string") && rawTeacher) {
      const id =
        typeof rawTeacher === "string"
          ? rawTeacher
          : rawTeacher._id || rawTeacher.id;
      if (id) {
        const userObj = usersMap[id];
        if (userObj) teacherName = displayName(userObj);
      }
    }
    return {
      _id: assessment._id,
      title: assessment.title || "—",
      type: assessment.type || "—",
      class: classLabel(classSubject.schoolClass),
      subject: classSubject.subject?.name || "—",
      teacher: teacherName || "—",
      window: `${formatDate(assessment.availableFrom)} → ${formatDate(assessment.availableTo)}`,
      status: assessment.isPublished ? "published" : "draft",
      __doc: assessment,
      __search:
        `${assessment.title} ${assessment.type} ${classSubject.subject?.name} ${teacherName}`.toLowerCase(),
    };
  });

  const classes = useMemo(() => {
    const seen = new Set();
    const list = [];
    rows.forEach((row) => {
      if (row.class && row.class !== "—") {
        if (!seen.has(row.class)) {
          seen.add(row.class);
          list.push(row.class);
        }
      }
    });
    return list.sort();
  }, [rows]);

  const filtered = rows.filter((row) => {
    const matchesSearch = row.__search.includes(search.toLowerCase());
    const matchesClass = !classFilter || row.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const togglePublish = async (row) => {
    setBusyId(row._id);
    try {
      if (row.status === "published") {
        await assessmentService.unpublish(row._id);
        toast.success("Assessment unpublished");
      } else {
        await assessmentService.publish(row._id);
        toast.success("Assessment published");
      }
      refetch();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await assessmentService.remove(selected._id);
      toast.success("Assessment deleted");
      setDeleteOpen(false);
      setSelected(null);
      refetch();
    } catch {
      // handled by the axios interceptor toast
    }
  };

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Type", accessor: "type" },
    { header: "Class", accessor: "class" },
    { header: "Subject", accessor: "subject" },
    { header: "Teacher", accessor: "teacher" },
    { header: "Availability", accessor: "window" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={FaEye}
            title="View assessment"
            onClick={() => {
              setSelected(row.__doc);
              setViewOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={row.status === "published" ? FaBan : FaCheckCircle}
            title={
              row.status === "published"
                ? "Unpublish assessment"
                : "Publish assessment"
            }
            loading={busyId === row._id}
            onClick={() => togglePublish(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={FaTrashAlt}
            title="Delete assessment"
            onClick={() => {
              setSelected(row.__doc);
              setDeleteOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <ManagePage
        title="Assessment Management"
        subtitle="Review, publish, or remove assessments created by teachers"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assessments..."
        columns={columns}
        rows={filtered}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyTitle="No assessments found"
        emptyDescription="Assessments created by teachers will appear here."
        toolbar={
          <div className="w-48">
            <Select
              name="class-filter"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={[
                { value: "", label: "All Classes" },
                ...classes.map((c) => ({ value: c, label: c })),
              ]}
              placeholder="Filter by Class"
            />
          </div>
        }
      />

      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={selected?.title || "Assessment"}
        maxWidth="xl"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex gap-2">
              <Badge variant="info">{selected.type}</Badge>
              <StatusBadge
                status={selected.isPublished ? "published" : "draft"}
              />
            </div>
            <p className="text-slate-gray">
              {selected.instructions || "No instructions provided."}
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <dt className="text-xs text-slate-gray">Class</dt>
                <dd className="font-medium text-primary">
                  {classLabel(selected.classSubject?.schoolClass)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-gray">Subject</dt>
                <dd className="font-medium text-primary">
                  {selected.classSubject?.subject?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-gray">Duration</dt>
                <dd className="font-medium text-primary">
                  {selected.duration || "—"} mins
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-gray">Max Attempts</dt>
                <dd className="font-medium text-primary">
                  {selected.maxAttempts || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-gray">Opens</dt>
                <dd className="font-medium text-primary">
                  {formatDate(selected.availableFrom)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-gray">Closes</dt>
                <dd className="font-medium text-primary">
                  {formatDate(selected.availableTo)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-gray">Session</dt>
                <dd className="font-medium text-primary">
                  {selected.session?.name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-gray">Term</dt>
                <dd className="font-medium text-primary">
                  {selected.term?.name || "—"}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Assessment"
        message={`Delete "${selected?.title}"? Students will no longer see it.`}
      />
    </>
  );
}
