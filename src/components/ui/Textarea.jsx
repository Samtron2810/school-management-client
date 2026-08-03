import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    rows = 4,
    className = "",
  },
  ref,
) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-primary"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2 rounded-lg border text-sm text-primary placeholder-slate-gray focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-vertical ${
          error ? "border-danger" : "border-gray-200"
        } ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } ${className}`}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
});

export default Textarea;
