import { FaUserGraduate } from "react-icons/fa";

import useMyChildren from "../../hooks/useMyChildren";

import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";

export default function ChildrenPage() {
  const { children, loading, error, refetch } = useMyChildren();

  if (loading) return <Loader text="Loading your children..." />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="My Children"
        subtitle="Children linked to your account and their current class"
      />
      {children.length === 0 ? (
        <EmptyState
          title="No children found"
          description="Your children appear here once the school links them to your account. Contact the school administrator if a child is missing."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Card key={child.id}>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={child.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-primary truncate">
                    {child.name}
                  </h3>
                  <p className="text-xs text-slate-gray mt-0.5">
                    Class: {child.className} · {child.admissionNumber}
                  </p>
                </div>
                {child.relationship && (
                  <Badge variant="info">{child.relationship}</Badge>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="flex items-center gap-2 text-sm text-slate-gray">
                  <FaUserGraduate className="text-royal-blue" />
                  Results on record
                </span>
                <Badge variant="info">{child.results}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
