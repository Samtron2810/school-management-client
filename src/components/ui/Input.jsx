import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    icon: Icon,
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
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-gray">
            <Icon className="text-sm" />
          </span>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-lg border text-sm text-primary placeholder-slate-gray focus:outline-none focus:ring-2 focus:ring-royal-blue/20 focus:border-royal-blue transition-colors ${
            error ? "border-crimson" : "border-gray-200"
          } ${Icon ? "pl-10" : ""} ${
            disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
          } ${className}`}
        />
      </div>
      {error && <p className="text-xs text-crimson mt-1">{error}</p>}
    </div>
  );
});

export default Input;
