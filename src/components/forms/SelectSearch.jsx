import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function SelectSearch({
  label,
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  error,
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-1" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border text-sm text-left transition-colors bg-white ${
            error ? "border-danger" : "border-gray-200 hover:border-accent"
          }`}
        >
          <span className={selected ? "text-primary" : "text-slate-gray"}>
            {selected ? selected.label : placeholder}
          </span>
          <FaChevronDown
            className={`text-xs text-slate-gray transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-3 py-1.5 rounded border border-gray-200 text-sm focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-gray text-center py-4">
                  No results found
                </p>
              ) : (
                filtered.map((opt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent-light ${
                      value === opt.value
                        ? "bg-accent-light text-accent font-medium"
                        : "text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
