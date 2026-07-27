import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";

import reportCardService from "../../services/reportCardService";
import useMyChildren from "../../hooks/useMyChildren";
import downloadBlobResponse from "../../utils/downloadBlob";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ReportCardView from "../../components/ReportCardView";

export default function ChildReportCardPage() {
  const { children, loading, error, refetch } = useMyChildren();
  const [childId, setChildId] = useState("");
  const [card, setCard] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notPublished, setNotPublished] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [downloading, setDownloading] = useState(false);

  // Default to the first child until the parent picks one explicitly.
  const effectiveChildId = childId || children[0]?.id || "";

  useEffect(() => {
    if (!effectiveChildId) return undefined;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setCardError(null);
      setNotPublished(false);
      setCard(null);
      try {
        const payload = await reportCardService.get(
          effectiveChildId,
          {},
          { skipErrorToast: true },
        );
        if (!cancelled) setCard(payload);
      } catch (err) {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          setNotPublished(true);
        } else {
          setCardError(err);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveChildId, reloadKey]);

  const download = async () => {
    setDownloading(true);
    try {
      const response = await reportCardService.download(effectiveChildId);
      const childName = children.find((c) => c.id === effectiveChildId)?.name;
      downloadBlobResponse(response, `${childName || "report-card"}.pdf`);
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loader text="Loading your children..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  const childOptions = children.map((child) => ({
    value: child.id,
    label: child.name,
  }));

  return (
    <div>
      <PageHeader
        title="Child Report Cards"
        subtitle="Term report card for the current session and term"
        actions={
          card && (
            <Button icon={FaDownload} onClick={download} loading={downloading}>
              Download
            </Button>
          )
        }
      />
      {children.length === 0 ? (
        <EmptyState
          title="No children found"
          description="Report cards unlock once your children are linked to your account and have a report card published."
        />
      ) : (
        <>
          <div className="w-full sm:w-72 mb-5">
            <Select
              label="Select Child"
              name="child"
              value={effectiveChildId}
              onChange={(event) => setChildId(event.target.value)}
              options={childOptions}
              placeholder="Select a child"
            />
          </div>
          {busy ? (
            <Loader text="Loading report card..." />
          ) : notPublished ? (
            <EmptyState
              title="Not published yet"
              description="This child's report card for the current term hasn't been published yet. Check back soon."
            />
          ) : cardError ? (
            <ErrorState
              title="Report card unavailable"
              description="Could not load this report card right now."
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : card ? (
            <Card>
              <ReportCardView card={card} />
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
