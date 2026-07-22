export default function Card({ children, className = "", padding = true }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 ${
        padding ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
