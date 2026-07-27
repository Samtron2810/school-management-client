import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";

import reportCardService from "../../services/reportCardService";
import useMyEnrollment from "../../hooks/useMyEnrollment";
import downloadBlobResponse from "../../utils/downloadBlob";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ReportCardView from "../../components/ReportCardView";

export default function ReportCardPage() {
  const { studentId, loading: enrollmentLoading, error: enrollmentError, refetch } = useMyEnrollment();
  const [card, setCard] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notPublished, setNotPublished] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!studentId) return undefined;
    let cancelled = false;
    const load = async () => {
      setBusy(true);
      setLoadError(null);
      setNotPublished(false);
      try {
        const payload = await reportCardService.get(studentId, {}, { skipErrorToast: true });
        if (!cancelled) setCard(payload);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setNotPublished(true);
        } else {
          setLoadError(err);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const download = async () => {
    setDownloading(true);
    try {
      const response = await reportCardService.download(studentId);
      downloadBlobResponse(response, "my-report-card.pdf");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (enrollmentLoading || busy) return <Loader text="Loading your report card..." />;
  if (enrollmentError) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="My Report Card"
        subtitle="Your report card for the current session and term"
        actions={
          card && (
            <Button icon={FaDownload} onClick={download} loading={downloading}>
              Download
            </Button>
          )
        }
      />
      {!studentId ? (
        <EmptyState
          title="Not enrolled"
          description="Your report card unlocks once you're enrolled in a class for the current session and term."
        />
      ) : notPublished ? (
        <EmptyState
          title="Not published yet"
          description="Your teacher or school admin hasn't published this term's report card yet. Check back soon."
        />
      ) : loadError ? (
        <ErrorState
          title="Report card unavailable"
          description="Could not load your report card right now."
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
