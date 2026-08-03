import { forwardRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

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
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-lg border text-sm text-primary placeholder-slate-gray focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors ${
            error ? "border-danger" : "border-gray-200"
          } ${Icon ? "pl-10" : ""} ${isPassword ? "pr-10" : ""} ${
            disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
          } ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-gray hover:text-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
});

export default Input;
