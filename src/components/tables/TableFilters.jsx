import { FaFilter } from "react-icons/fa";

export default function TableFilters({
  filters = [],
  onFilterChange,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <FaFilter className="text-slate-gray text-sm" />
      {filters.map((filter, index) => (
        <select
          key={index}
          value={filter.value}
          onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-slate-gray focus:outline-none focus:border-accent bg-white"
        >
          <option value="">
            {filter.placeholder || `All ${filter.label}`}
          </option>
          {filter.options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
