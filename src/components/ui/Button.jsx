const variantStyles = {
  primary: "bg-royal-blue text-white hover:bg-royal-blue/80",
  secondary: "bg-gray-100 text-slate-gray hover:bg-gray-200",
  danger: "bg-crimson text-white hover:bg-crimson/80",
  ghost: "text-slate-gray hover:bg-gray-100",
  outline: "border border-royal-blue text-royal-blue hover:bg-royal-blue/10",
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
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors ${
        variantStyles[variant]
      } ${sizeClasses[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {Icon && <Icon className="text-base" />}
      {children}
    </button>
  );
}
