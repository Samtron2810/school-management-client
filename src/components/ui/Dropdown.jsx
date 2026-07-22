import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function Dropdown({ label, items, onSelect, className = "" }) {
  const [open, setOpen] = useState(false);
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

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-slate-gray hover:border-royal-blue transition-colors bg-white"
      >
        <span>{label}</span>
        <FaChevronDown
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                onSelect?.(item);
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-gray hover:bg-gray-100 transition-colors"
            >
              {item.icon && <item.icon className="text-sm" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
