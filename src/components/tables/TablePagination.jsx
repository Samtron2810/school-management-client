import Pagination from "../common/Pagination";

export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  return (
    <div className="px-4 py-3">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
