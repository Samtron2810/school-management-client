import useMyEnrollment from "../../hooks/useMyEnrollment";
import { classLabel } from "../../utils/apiData";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

export default function MyClassesPage() {
  const { enrollment, schoolClass, context, loading, error, refetch } =
    useMyEnrollment();

  if (loading) return <Loader text="Loading your class..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="My Class"
        subtitle="Your class enrollment for the current session and term"
      />
      {!schoolClass ? (
        <EmptyState
          title="Not enrolled"
          description="You have no active class enrollment for the current session and term. Contact an administrator."
        />
      ) : (
        <Card className="max-w-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">
                {classLabel(schoolClass)}
              </h2>
              <p className="text-sm text-slate-gray mt-1">
                {schoolClass.level || "Class"} · Roll no.{" "}
                {enrollment?.rollNumber ?? "N/A"}
              </p>
            </div>
            <Badge variant="success">{enrollment?.status || "Active"}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div>
              <dt className="text-xs text-slate-gray">Session</dt>
              <dd className="font-medium text-primary">
                {enrollment?.session?.name || context?.session?.name || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-gray">Term</dt>
              <dd className="font-medium text-primary">
                {enrollment?.term?.name || context?.term?.name || "N/A"}
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
