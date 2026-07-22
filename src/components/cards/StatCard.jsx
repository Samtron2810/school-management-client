export default function StatCard({ label, value, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-gray">{label}</p>
          <p className="text-2xl font-bold text-primary mt-1">{value}</p>
          {trend !== undefined && (
            <p
              className={`text-xs mt-1 ${trend >= 0 ? "text-green-600" : "text-crimson"}`}
            >
              {trend >= 0 ? "+" : ""}
              {trend}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-light-blue text-royal-blue">
          <Icon className="text-2xl" />
        </div>
      </div>
    </div>
  );
}
