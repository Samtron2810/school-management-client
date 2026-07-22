export default function InfoCard({
  label,
  value,
  icon: Icon,
  color = "text-royal-blue",
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-light-blue ${color}`}>
          <Icon className="text-xl" />
        </div>
        <div>
          <p className="text-sm text-slate-gray">{label}</p>
          <p className="text-lg font-semibold text-primary mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}
