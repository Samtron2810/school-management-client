import { FaSpinner } from "react-icons/fa";

export default function Loader({ size = "md", text = "Loading..." }) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FaSpinner
        className={`animate-spin text-royal-blue ${sizeClasses[size]}`}
      />
      {text && <p className="text-sm text-slate-gray mt-3">{text}</p>}
    </div>
  );
}
