export default function StatCard({
  icon: Icon,
  title,
  value,
  color = "text-primary",
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 sm:p-5 border border-gray-100 hover:shadow-lg transition-shadow min-w-0">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg bg-accent-light shrink-0 ${color}`}>
          <Icon className="text-lg sm:text-xl" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-slate-gray truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-0.5 sm:mt-1 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
