import { useEffect, useState } from "react";

import resultService from "../../services/resultService";
import useMyChildren from "../../hooks/useMyChildren";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import ReportCardView from "../../components/ReportCardView";

export default function ChildReportCardPage() {
  const { children, loading, error, refetch } = useMyChildren();
  const [childId, setChildId] = useState("");
  const [card, setCard] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Default to the first child until the parent picks one explicitly.
  const effectiveChildId = childId || children[0]?.id || "";

  useEffect(() => {
    if (!effectiveChildId) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setCardError(null);
      setCard(null);
      try {
        const payload = await resultService.reportCard(effectiveChildId);
        if (!cancelled) setCard(payload);
      } catch (err) {
        if (!cancelled) setCardError(err);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveChildId, reloadKey]);

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
      />
      {children.length === 0 ? (
        <EmptyState
          title="No children found"
          description="Report cards unlock once your children are linked to your account and have results recorded."
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
            <Loader text="Building report card..." />
          ) : cardError ? (
            <ErrorState
              title="Report card unavailable"
              description="Could not generate this report card right now. It may unlock once more results are recorded this term."
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
