import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function PageScaffold({
  title,
  subtitle,
  stats = [],
  items = [],
  primaryAction = "Add New",
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-gray">{subtitle}</p>}
        </div>
        <Button>{primaryAction}</Button>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <p className="text-sm text-slate-gray">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card padding={false}>
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-primary">Overview</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-primary">{item.title}</p>
                <p className="text-sm text-slate-gray">{item.description}</p>
              </div>
              {item.meta && (
                <span className="text-sm font-medium text-royal-blue">
                  {item.meta}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
