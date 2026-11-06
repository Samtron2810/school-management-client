import { useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

// Searchable multi-select for students. `options`: [{ value, label, sub }].
// Selection survives searching, so one class's students can be picked from
// several searches, and the picked ones stay visible as removable chips.
export default function StudentPicker({
  options,
  selected,
  onChange,
  loading = false,
  emptyText = "No students found.",
}) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      `${o.label} ${o.sub || ""}`.toLowerCase().includes(q),
    );
  }, [options, query]);

  const byId = useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options],
  );

  const toggle = (id) =>
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );

  const allShownSelected =
    shown.length > 0 && shown.every((o) => selected.includes(o.value));

  const toggleShown = () => {
    if (allShownSelected) {
      const hide = new Set(shown.map((o) => o.value));
      onChange(selected.filter((id) => !hide.has(id)));
    } else {
      onChange([
        ...selected,
        ...shown.map((o) => o.value).filter((id) => !selected.includes(id)),
      ]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray text-sm" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or admission number"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-gray">
        <span>
          {shown.length} of {options.length} not yet enrolled
        </span>
        {shown.length > 0 && (
          <button
            type="button"
            onClick={toggleShown}
            className="text-accent hover:underline"
          >
            {allShownSelected
              ? query
                ? "Unselect these"
                : "Unselect all"
              : query
                ? "Select these"
                : "Select all"}
          </button>
        )}
      </div>

      <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
        {loading ? (
          <p className="p-3 text-sm text-slate-gray">Loading students...</p>
        ) : shown.length === 0 ? (
          <p className="p-3 text-sm text-slate-gray">
            {options.length === 0 ? emptyText : "No match for your search."}
          </p>
        ) : (
          shown.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="w-4 h-4 accent-coral shrink-0"
              />
              <span className="min-w-0">
                {option.label}
                {option.sub && (
                  <span className="text-slate-gray"> · {option.sub}</span>
                )}
              </span>
            </label>
          ))
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {selected.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs rounded-full bg-accent-light text-primary"
            >
              {byId.get(id)?.label || "Student"}
              <button
                type="button"
                onClick={() => toggle(id)}
                aria-label="Remove"
                className="p-0.5 hover:text-danger"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
