import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaDownload, FaLockOpen, FaLock } from "react-icons/fa";

import reportCardService from "../services/reportCardService";
import { displayName } from "../utils/apiData";
import downloadBlobResponse from "../utils/downloadBlob";

import Loader from "./common/Loader";
import ErrorState from "./common/ErrorState";
import EmptyState from "./common/EmptyState";
import DataTable from "./tables/DataTable";
import Modal from "./ui/Modal";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Select from "./ui/Select";
import ReportCardView from "./ReportCardView";

// Class-wide report card list + publish controls, shared by the admin and
// teacher report pages. classOptions: [{ value, label }].
export default function ClassReportCards({ classOptions }) {
  const [classId, setClassId] = useState("");
  const [payload, setPayload] = useState(null); // { schoolClass, session, term, batch, students }
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = async (targetClassId = classId) => {
    if (!targetClassId) return;
    setBusy(true);
    setLoadError(false);
    setSelectedIds([]);
    try {
      const data = await reportCardService.list({ schoolClass: targetClassId });
      setPayload(data);
    } catch {
      setPayload(null);
      setLoadError(true);
    } finally {
      setBusy(false);
    }
  };

  const students = payload?.students || [];

  const toggleSelect = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === students.length ? [] : students.map((s) => s.student._id),
    );
  };

  const viewCard = async (studentId) => {
    setActiveStudentId(studentId);
    setCardLoading(true);
    try {
      const card = await reportCardService.get(studentId);
      setActiveCard(card);
    } catch {
      setActiveCard(null);
      toast.error("Could not load this report card");
    } finally {
      setCardLoading(false);
    }
  };

  const downloadOne = async (studentId, name) => {
    setDownloading(true);
    try {
      const response = await reportCardService.download(studentId);
      downloadBlobResponse(response, `${name || "report-card"}.pdf`);
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const downloadSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one student first.");
      return;
    }
    setDownloading(true);
    try {
      const response = await reportCardService.bulkDownload({
        students: selectedIds,
      });
      downloadBlobResponse(response, "report-cards.zip");
    } catch {
      toast.error("Bulk download failed");
    } finally {
      setDownloading(false);
    }
  };

  const publishClass = async () => {
    if (!classId) return;
    setPublishing(true);
    try {
      await reportCardService.publishClass(classId);
      toast.success("Report cards published for this class");
      await load();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setPublishing(false);
    }
  };

  const unpublishClass = async () => {
    if (!classId) return;
    setPublishing(true);
    try {
      await reportCardService.unpublishClass(classId);
      toast.success("Report cards unpublished for this class");
      await load();
    } catch {
      // handled by the axios interceptor toast
    } finally {
      setPublishing(false);
    }
  };

  const toggleStudentPublish = async (studentId, nextValue) => {
    try {
      await reportCardService.setStudentPublishState(studentId, {
        isPublished: nextValue,
      });
      toast.success(
        nextValue ? "Student report card published" : "Student report card unpublished",
      );
      await load();
    } catch {
      // handled by the axios interceptor toast
    }
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={students.length > 0 && selectedIds.length === students.length}
          onChange={toggleSelectAll}
          className="w-4 h-4 accent-royal-blue"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.student._id)}
          onChange={() => toggleSelect(row.student._id)}
          className="w-4 h-4 accent-royal-blue"
        />
      ),
    },
    {
      header: "Student",
      render: (row) => displayName(row.student.user) || "Student",
    },
    {
      header: "Admission No.",
      render: (row) => row.student.admissionNumber || "—",
    },
    { header: "Subjects", render: (row) => row.subjectCount },
    {
      header: "Status",
      render: (row) =>
        row.isComplete ? (
          <Badge variant="success">Complete</Badge>
        ) : (
          <Badge variant="warning">Incomplete</Badge>
        ),
    },
    {
      header: "Published",
      render: (row) =>
        row.isPublished ? (
          <Badge variant="success">Published</Badge>
        ) : row.anyPublished ? (
          <Badge variant="warning">Partial</Badge>
        ) : (
          <Badge variant="default">Draft</Badge>
        ),
    },
    {
      header: "",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => viewCard(row.student._id)}>
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FaDownload}
            onClick={() => downloadOne(row.student._id, displayName(row.student.user))}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={row.isPublished ? FaLock : FaLockOpen}
            onClick={() => toggleStudentPublish(row.student._id, !row.isPublished)}
          />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold text-primary mb-4">Class Report Cards</h2>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-5">
        <div className="flex-1">
          <Select
            label="Class"
            name="report-class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setPayload(null);
              if (e.target.value) load(e.target.value);
            }}
            options={classOptions}
            placeholder={classOptions.length ? "Select a class" : "No classes available"}
          />
        </div>
        <Button onClick={() => load()} disabled={!classId || busy} loading={busy}>
          Load Class
        </Button>
      </div>

      {busy ? (
        <Loader text="Loading report cards..." />
      ) : loadError ? (
        <ErrorState onRetry={() => load()} />
      ) : payload === null ? (
        <p className="text-sm text-slate-gray">
          Pick a class to see every student who has at least one score recorded this
          term — complete or incomplete — and to publish or download their report
          cards.
        </p>
      ) : students.length === 0 ? (
        <EmptyState
          title="No report cards yet"
          description="No actively enrolled students have any scores recorded for this term yet."
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <p className="text-xs text-slate-gray">
              {students.length} student{students.length === 1 ? "" : "s"} ·{" "}
              {payload.session?.name} · {payload.term?.name} ·{" "}
              {payload.batch?.isPublished ? (
                <span className="text-green-600 font-medium">Class published</span>
              ) : (
                <span className="text-slate-gray">Class not published</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={FaDownload}
                onClick={downloadSelected}
                loading={downloading}
                disabled={selectedIds.length === 0}
              >
                Download Selected ({selectedIds.length})
              </Button>
              {payload.batch?.isPublished ? (
                <Button variant="secondary" size="sm" icon={FaLock} onClick={unpublishClass} loading={publishing}>
                  Unpublish Class
                </Button>
              ) : (
                <Button size="sm" icon={FaCheckCircle} onClick={publishClass} loading={publishing}>
                  Publish Class
                </Button>
              )}
            </div>
          </div>
          <DataTable columns={columns} data={students} pageSize={15} />
        </>
      )}

      <Modal
        isOpen={Boolean(activeStudentId)}
        onClose={() => {
          setActiveStudentId(null);
          setActiveCard(null);
        }}
        title="Report Card"
        maxWidth="2xl"
      >
        {cardLoading ? <Loader text="Loading report card..." /> : <ReportCardView card={activeCard} />}
      </Modal>
    </Card>
  );
}
