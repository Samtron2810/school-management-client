import Avatar from "../ui/Avatar";

export default function ProfileCard({ name, role, email, avatar, stats = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex flex-col items-center text-center">
        <Avatar src={avatar} name={name} size="xl" />
        <h3 className="text-lg font-semibold text-primary mt-4">{name}</h3>
        <p className="text-sm text-accent font-medium">{role}</p>
        <p className="text-sm text-slate-gray mt-1">{email}</p>
      </div>
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-slate-gray">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
