const badgeStyles = {
  default: "bg-gray-100 text-slate-gray",
  primary: "bg-royal-blue/10 text-royal-blue",
  success: "bg-green-50 text-green-700",
  warning: "bg-yellow-50 text-yellow-700",
  danger: "bg-red-50 text-crimson",
  info: "bg-light-blue text-royal-blue",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-sm",
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${badgeStyles[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}
