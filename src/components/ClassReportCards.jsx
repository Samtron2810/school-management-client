import { useState } from "react";

import resultService from "../services/resultService";
import { displayName } from "../utils/apiData";

import Loader from "./common/Loader";
import ErrorState from "./common/ErrorState";
import EmptyState from "./common/EmptyState";
import DataTable from "./tables/DataTable";
import Modal from "./ui/Modal";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Select from "./ui/Select";
import ReportCardView from "./ReportCardView";

// Bulk report cards for a whole class (GET /results/report-cards) — shared by
// the admin and teacher report pages. classOptions: [{ value, label }].
export default function ClassReportCards({ classOptions }) {
  const [classId, setClassId] = useState("");
  const [bundle, setBundle] = useState(null); // { schoolClass, count, reportCards }
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const load = async (targetClassId = classId) => {
    if (!targetClassId) return;
    setBusy(true);
    setLoadError(false);
    try {
      const payload = await resultService.classReportCards({
        schoolClass: targetClassId,
      });
      setBundle(payload);
    } catch {
      setBundle(null);
      setLoadError(true);
    } finally {
      setBusy(false);
    }
  };

  const rows = (bundle?.reportCards || []).map((card) => {
    const summary = card.summary || {};
    return {
      id: card.student?._id || card.student,
      student: displayName(card.student?.user) || "Student",
      admissionNumber: card.student?.admissionNumber || "—",
      subjects: summary.subjectCount ?? 0,
      average:
        summary.averagePercentage != null
          ? `${summary.averagePercentage}%`
          : "—",
      total:
        summary.totalScore != null
          ? `${summary.totalScore}/${summary.totalMarks ?? 0}`
          : "—",
      __card: card,
    };
  });

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Admission No.", accessor: "admissionNumber" },
    { header: "Subjects", accessor: "subjects" },
    { header: "Total", accessor: "total" },
    { header: "Average", accessor: "average" },
    {
      header: "",
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => setActiveCard(row.__card)}>
          View Card
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold text-primary mb-4">
        Whole-Class Report Cards
      </h2>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end mb-5">
        <div className="flex-1">
          <Select
            label="Class"
            name="report-class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setBundle(null);
              if (e.target.value) load(e.target.value);
            }}
            options={classOptions}
            placeholder={classOptions.length ? "Select a class" : "No classes available"}
          />
        </div>
        <Button onClick={() => load()} disabled={!classId || busy} loading={busy}>
          Generate All
        </Button>
      </div>

      {busy ? (
        <Loader text="Generating report cards..." />
      ) : loadError ? (
        <ErrorState onRetry={() => load()} />
      ) : bundle === null ? (
        <p className="text-sm text-slate-gray">
          Pick a class to generate report cards for every actively enrolled
          student at once (current session and term).
        </p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No report cards"
          description="No actively enrolled students in this class, or no results recorded yet."
        />
      ) : (
        <>
          <p className="text-xs text-slate-gray mb-3">
            {bundle.count} report card{bundle.count === 1 ? "" : "s"} generated
            · {bundle.session?.name || "current session"}
          </p>
          <DataTable columns={columns} data={rows} pageSize={15} />
        </>
      )}

      <Modal
        isOpen={Boolean(activeCard)}
        onClose={() => setActiveCard(null)}
        title="Report Card"
        maxWidth="2xl"
      >
        <ReportCardView card={activeCard} />
      </Modal>
    </Card>
  );
}
