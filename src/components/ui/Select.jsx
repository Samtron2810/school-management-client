import { forwardRef } from "react";

const Select = forwardRef(function Select(
  {
    label,
    name,
    value,
    onChange,
    options,
    placeholder = "Select an option",
    error,
    required = false,
    disabled = false,
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
          {required && <span className="text-crimson ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg border text-sm text-primary focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-colors ${
          error ? "border-crimson" : "border-gray-200"
        } ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-crimson mt-1">{error}</p>}
    </div>
  );
});

export default Select;
