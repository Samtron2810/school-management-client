export default function StatCard({
  icon: Icon,
  title,
  value,
  color = "text-primary",
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-accent-light ${color}`}>
          <Icon className="text-xl" />
        </div>
        <div>
          <p className="text-sm text-slate-gray">{title}</p>
          <p className="text-2xl font-bold text-primary mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}
