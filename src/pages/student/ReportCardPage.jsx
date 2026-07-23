import { useEffect, useState } from "react";

import resultService from "../../services/resultService";
import useMyEnrollment from "../../hooks/useMyEnrollment";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import ReportCardView from "../../components/ReportCardView";

export default function ReportCardPage() {
  const { studentId, loading: enrollmentLoading, error: enrollmentError, refetch } = useMyEnrollment();
  const [card, setCard] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    const load = async () => {
      setBusy(true);
      setLoadError(null);
      try {
        const payload = await resultService.reportCard(studentId);
        if (!cancelled) setCard(payload);
      } catch (err) {
        if (!cancelled) setLoadError(err);
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (enrollmentLoading || busy) return <Loader text="Building your report card..." />;
  if (enrollmentError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="My Report Card" subtitle="Your report card for the current session and term" />
      {!studentId ? (
        <EmptyState
          title="Not enrolled"
          description="Your report card unlocks once you're enrolled in a class for the current session and term."
        />
      ) : loadError ? (
        <ErrorState
          title="Report card unavailable"
          description="Could not generate your report card right now. It may unlock once results are recorded."
          onRetry={() => window.location.reload()}
        />
      ) : card ? (
        <Card>
          <ReportCardView card={card} />
        </Card>
      ) : null}
    </div>
  );
}
