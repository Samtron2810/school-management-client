import { useRef } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";

export default function FileInput({
  label,
  name,
  value,
  onChange,
  accept,
  error,
  required = false,
}) {
  const inputRef = useRef(null);

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
      <div
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-between px-4 py-3 rounded-lg border border-dashed cursor-pointer transition-colors ${
          error
            ? "border-crimson bg-red-50"
            : "border-gray-200 hover:border-royal-blue bg-gray-50"
        }`}
      >
        <span className="text-sm text-slate-gray">
          {value ? value.name : "Click to upload"}
        </span>
        <FaUpload className="text-slate-gray" />
      </div>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-crimson flex items-center gap-1 mt-1 hover:underline"
        >
          <FaTimes /> Remove file
        </button>
      )}
      {error && <p className="text-xs text-crimson mt-1">{error}</p>}
    </div>
  );
}
