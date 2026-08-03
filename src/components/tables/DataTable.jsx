import { useState } from "react";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import SearchInput from "../common/SearchInput";
import Pagination from "../common/Pagination";

export default function DataTable({
  columns,
  data,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue,
  pageSize = 10,
  currentPage: controlledPage,
  totalPages: controlledTotalPages,
  onPageChange,
  onRowClick,
  className = "",
}) {
  const [localPage, setLocalPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const isControlled = controlledPage !== undefined;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  let sortedData = [...data];
  if (sortKey) {
    sortedData.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  const page = isControlled ? controlledPage : localPage;
  const totalPages = isControlled
    ? controlledTotalPages
    : Math.ceil(sortedData.length / pageSize);
  const displayData = isControlled
    ? sortedData
    : sortedData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 ${className}`}
    >
      {searchable && (
        <div className="p-4 border-b border-gray-100">
          <SearchInput
            value={searchValue}
            onChange={onSearch}
            placeholder={searchPlaceholder}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`text-left px-4 py-3 text-xs font-semibold text-slate-gray uppercase tracking-wider ${
                    col.sortable
                      ? "cursor-pointer select-none hover:text-primary"
                      : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (sortKey === col.accessor ? (
                        sortDir === "asc" ? (
                          <FaSortUp className="text-accent" />
                        ) : (
                          <FaSortDown className="text-accent" />
                        )
                      ) : (
                        <FaSort className="text-slate-gray" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center px-4 py-8 text-sm text-slate-gray"
                >
                  No data available
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-100 transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-primary">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-gray-100">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            if (isControlled) {
              onPageChange?.(p);
            } else {
              setLocalPage(p);
            }
          }}
        />
      </div>
    </div>
  );
}
