import { FaSpinner } from "react-icons/fa";

const variantStyles = {
  primary: "bg-coral text-white hover:bg-coral/80",
  secondary: "bg-gray-100 text-slate-gray hover:bg-gray-200",
  danger: "bg-danger text-white hover:bg-danger/80",
  ghost: "text-slate-gray hover:bg-gray-100",
  outline: "border border-accent text-accent hover:bg-accent/10",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  icon: Icon,
  loading = false,
  title,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ${
        variantStyles[variant]
      } ${sizeClasses[size]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : (
        Icon && <Icon className="text-base" />
      )}
      {children}
    </button>
  );
}
