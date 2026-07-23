import { FaPlus } from "react-icons/fa";

import PageHeader from "./common/PageHeader";
import SearchInput from "./common/SearchInput";
import EmptyState from "./common/EmptyState";
import ErrorState from "./common/ErrorState";
import Loader from "./common/Loader";
import DataTable from "./tables/DataTable";
import ActionButton from "./buttons/ActionButton";

// Shared list-page pattern for API-backed resources:
//   PageHeader (+Add action) → SearchInput → Loader/ErrorState/EmptyState/DataTable
export default function ManagePage({
  title,
  subtitle,
  actionLabel,
  onAdd,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  columns,
  rows,
  loading,
  error,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  searchable = true,
  pageSize = 10,
  toolbar = null,
  hideHeader = false,
}) {
  return (
    <div>
      {!hideHeader && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={
            actionLabel && onAdd ? (
              <ActionButton label={actionLabel} icon={FaPlus} onClick={onAdd} />
            ) : null
          }
        />
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        {searchable && (
          <div className="flex-1">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        {toolbar}
      </div>

      {loading ? (
        <Loader text={`Loading ${title?.toLowerCase() || "data"}...`} />
      ) : error ? (
        <ErrorState onRetry={onRetry} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          {...(actionLabel && onAdd
            ? { actionLabel, onAction: onAdd }
            : {})}
        />
      ) : (
        <DataTable columns={columns} data={rows} pageSize={pageSize} />
      )}
    </div>
  );
}
