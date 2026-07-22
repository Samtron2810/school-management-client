export default function DatePicker({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  className = "",
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-primary"
        >
          {label}
          {required && <span className="text-crimson ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2 rounded-lg border text-sm text-primary focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-colors bg-white ${
          error ? "border-crimson" : "border-gray-200"
        } ${className}`}
      />
      {error && <p className="text-xs text-crimson mt-1">{error}</p>}
    </div>
  );
}
