import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaDownload,
  FaFileArchive,
  FaLockOpen,
  FaLock,
} from "react-icons/fa";

import reportCardService from "../services/reportCardService";
import sessionService from "../services/sessionService";
import termService from "../services/termService";
import useApi from "../hooks/useApi";
import { asArray, displayName } from "../utils/apiData";
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

// Blob responses hide the JSON error body; read the server's message from it.
const blobErrorMessage = async (error, fallback) => {
  try {
    const text = await error?.response?.data?.text?.();
    return JSON.parse(text)?.message || fallback;
  } catch {
    return fallback;
  }
};

// Class-wide report card list + publish controls, shared by the admin and
// teacher report pages. classOptions: [{ value, label }].
export default function ClassReportCards({ classOptions }) {
  const [classId, setClassId] = useState("");

  // Session / term default to the current ones; picking others lets staff
  // generate or reprint any past term.
  const sessionsApi = useApi(sessionService.list);
  const sessionList = asArray(sessionsApi.data);
  const [sessionChoice, setSessionChoice] = useState("");
  const [termChoice, setTermChoice] = useState("");
  const activeSessionId =
    sessionChoice || sessionList.find((s) => s.isCurrent)?._id || "";

  const [termsState, setTermsState] = useState({ sessionId: "", list: [] });
  useEffect(() => {
    if (!activeSessionId) return undefined;
    let cancelled = false;
    termService
      .list({ session: activeSessionId })
      .then((data) => {
        if (!cancelled) {
          setTermsState({ sessionId: activeSessionId, list: asArray(data) });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeSessionId]);

  const termList = (
    termsState.sessionId === activeSessionId ? termsState.list : []
  )
    .slice()
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const activeTermId = termList.some((t) => t._id === termChoice)
    ? termChoice
    : termList.find((t) => t.isCurrent)?._id || termList[0]?._id || "";

  const period = {
    ...(activeSessionId && { session: activeSessionId }),
    ...(activeTermId && { term: activeTermId }),
  };

  const sessionOptions = sessionList.map((s) => ({
    value: s._id,
    label: s.isCurrent ? `${s.name} (current)` : s.name,
  }));
  const termOptions = termList.map((t) => ({ value: t._id, label: t.name }));

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
      const data = await reportCardService.list({
        schoolClass: targetClassId,
        ...period,
      });
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
      const card = await reportCardService.get(studentId, period);
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
      const response = await reportCardService.download(studentId, period);
      downloadBlobResponse(response, `${name || "report-card"}.pdf`);
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  // One request builds the whole zip server-side; `extra` narrows it.
  const downloadClassZip = async (extra, fallbackName) => {
    setDownloading(true);
    try {
      const response = await reportCardService.downloadClass(
        classId,
        { ...period, ...extra },
        { skipErrorToast: true },
      );
      downloadBlobResponse(response, fallbackName);
    } catch (error) {
      toast.error(await blobErrorMessage(error, "Download failed"));
    } finally {
      setDownloading(false);
    }
  };

  const downloadSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one student first.");
      return;
    }
    downloadClassZip({ students: selectedIds }, "report-cards.zip");
  };

  const publishClass = async () => {
    if (!classId) return;
    setPublishing(true);
    try {
      await reportCardService.publishClass(classId, period);
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
      await reportCardService.unpublishClass(classId, period);
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
        ...period,
      });
      toast.success(
        nextValue
          ? "Student report card published"
          : "Student report card unpublished",
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
          checked={
            students.length > 0 && selectedIds.length === students.length
          }
          onChange={toggleSelectAll}
          className="w-4 h-4 accent-coral"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.student._id)}
          onChange={() => toggleSelect(row.student._id)}
          className="w-4 h-4 accent-coral"
        />
      ),
    },
    {
      header: "Student",
      render: (row) => displayName(row.student.user) || "Student",
    },
    {
      header: "Admission No.",
      render: (row) => row.student.admissionNumber || "N/A",
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewCard(row.student._id)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={FaDownload}
            title="Download report card"
            onClick={() =>
              downloadOne(row.student._id, displayName(row.student.user))
            }
          />
          <Button
            variant="ghost"
            size="sm"
            icon={row.isPublished ? FaLock : FaLockOpen}
            title={
              row.isPublished ? "Unpublish report card" : "Publish report card"
            }
            onClick={() =>
              toggleStudentPublish(row.student._id, !row.isPublished)
            }
          />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold text-primary mb-4">
        Class Report Cards
      </h2>
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
            placeholder={
              classOptions.length ? "Select a class" : "No classes available"
            }
          />
        </div>
        <div className="sm:w-44">
          <Select
            label="Session"
            name="report-session"
            value={activeSessionId}
            onChange={(e) => {
              setSessionChoice(e.target.value);
              setTermChoice("");
              setPayload(null);
            }}
            options={sessionOptions}
            placeholder="Session"
          />
        </div>
        <div className="sm:w-40">
          <Select
            label="Term"
            name="report-term"
            value={activeTermId}
            onChange={(e) => {
              setTermChoice(e.target.value);
              setPayload(null);
            }}
            options={termOptions}
            placeholder="Term"
          />
        </div>
        <Button
          onClick={() => load()}
          disabled={!classId || busy}
          loading={busy}
        >
          Load Class
        </Button>
      </div>

      {busy ? (
        <Loader text="Loading report cards..." />
      ) : loadError ? (
        <ErrorState onRetry={() => load()} />
      ) : payload === null ? (
        <p className="text-sm text-slate-gray">
          Pick a class, session and term, then load it to see every student with
          at least one score recorded — complete or incomplete — and to publish
          or download their report cards.
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
                <span className="text-green-600 font-medium">
                  Class published
                </span>
              ) : (
                <span className="text-slate-gray">Class not published</span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={FaFileArchive}
                onClick={() =>
                  downloadClassZip({}, "class-report-cards.zip")
                }
                loading={downloading}
              >
                Class ZIP
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FaFileArchive}
                onClick={() =>
                  downloadClassZip({ term: "all" }, "class-report-cards.zip")
                }
                loading={downloading}
              >
                All Terms ZIP
              </Button>
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
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FaLock}
                  onClick={unpublishClass}
                  loading={publishing}
                >
                  Unpublish Class
                </Button>
              ) : (
                <Button
                  size="sm"
                  icon={FaCheckCircle}
                  onClick={publishClass}
                  loading={publishing}
                >
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
        {cardLoading ? (
          <Loader text="Loading report card..." />
        ) : (
          <ReportCardView card={activeCard} />
        )}
      </Modal>
    </Card>
  );
}
