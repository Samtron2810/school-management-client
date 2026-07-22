export default function Toggle({ enabled, onChange, label, className = "" }) {
  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange?.(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-royal-blue/20 ${
          enabled ? "bg-royal-blue" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && <span className="text-sm text-primary">{label}</span>}
    </label>
  );
}
