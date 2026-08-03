export default function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="block text-sm font-medium text-primary">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </p>
      )}
      <div className="space-y-2">
        {options.map((opt, index) => (
          <label key={index} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="w-4 h-4 border-gray-300 text-accent focus:ring-accent/20"
            />
            <span className="text-sm text-primary">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
