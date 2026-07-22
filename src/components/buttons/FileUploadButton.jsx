import { useRef } from "react";
import { FaUpload } from "react-icons/fa";

export default function FileUploadButton({
  onFileSelect,
  accept,
  label = "Upload File",
  className = "",
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect?.(file);
    }
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-slate-gray hover:border-royal-blue hover:text-royal-blue transition-colors bg-white ${className}`}
      >
        <FaUpload />
        <span>{label}</span>
      </button>
    </>
  );
}
