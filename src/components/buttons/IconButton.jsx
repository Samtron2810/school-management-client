export default function IconButton({
  icon: Icon,
  onClick,
  label,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg text-slate-gray hover:bg-gray-100 hover:text-primary transition-colors ${className}`}
    >
      <Icon className="text-lg" />
    </button>
  );
}
