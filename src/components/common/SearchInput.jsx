import { FaSearch } from "react-icons/fa";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray text-sm" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm text-primary placeholder-slate-gray focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors bg-white"
      />
    </div>
  );
}
