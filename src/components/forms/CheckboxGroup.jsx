export default function CheckboxGroup({
  label,
  name,
  options,
  selectedValues = [],
  onChange,
  required = false,
}) {
  const handleChange = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange?.(newValues);
  };

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
              type="checkbox"
              name={name}
              value={opt.value}
              checked={selectedValues.includes(opt.value)}
              onChange={() => handleChange(opt.value)}
              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent/20"
            />
            <span className="text-sm text-primary">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
