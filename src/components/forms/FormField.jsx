export default function FormField({
  label,
  required = false,
  error,
  children,
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-primary">
          {label}
          {required && <span className="text-crimson ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-crimson mt-1">{error}</p>}
    </div>
  );
}
