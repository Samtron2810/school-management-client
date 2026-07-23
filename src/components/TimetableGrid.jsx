import { displayName, classLabel } from "../utils/apiData";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Weekly timetable grid: one column per day, periods stacked by start time.
// Entry shape (from the API, populated):
//   { dayOfWeek, startTime, endTime,
//     classSubject: { subject: { name, code } },
//     schoolClass: { className, arm },
//     teacherAssignment: { teacher: { user } } }
export default function TimetableGrid({
  entries = [],
  days = DAYS.slice(0, 6),
  showTeacher = true,
  showClass = false,
  onSelect = null,
}) {
  const byDay = Object.fromEntries(days.map((day) => [day, []]));
  entries.forEach((entry) => {
    if (byDay[entry.dayOfWeek]) byDay[entry.dayOfWeek].push(entry);
    else (byDay[entry.dayOfWeek] = byDay[entry.dayOfWeek] || []).push(entry);
  });
  Object.values(byDay).forEach((list) =>
    list.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
  );

  const displayDays = days.filter((day) => byDay[day]);
  const hasAny = entries.length > 0;

  if (!hasAny) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {displayDays.map((day) => (
        <div
          key={day}
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
        >
          <div className="px-3 py-2.5 bg-royal-blue/10 border-b border-royal-blue/20">
            <h3 className="text-sm font-semibold text-primary">{day}</h3>
          </div>
          <div className="p-2.5 space-y-2.5">
            {(byDay[day] || []).map((entry) => {
              const subject = entry.classSubject?.subject;
              const teacherName = displayName(
                entry.teacherAssignment?.teacher?.user,
              );
              return (
                <button
                  type="button"
                  key={entry._id}
                  onClick={() => onSelect?.(entry)}
                  className={`w-full text-left px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 transition-colors ${
                    onSelect ? "hover:border-royal-blue/40 hover:bg-royal-blue/5 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <p className="text-xs font-semibold text-royal-blue">
                    {entry.startTime} – {entry.endTime}
                  </p>
                  <p className="text-sm font-medium text-primary mt-0.5">
                    {subject?.name || "Period"}
                  </p>
                  {showClass && (
                    <p className="text-xs text-slate-gray mt-0.5">
                      {classLabel(entry.schoolClass)}
                    </p>
                  )}
                  {showTeacher && teacherName && (
                    <p className="text-xs text-slate-gray mt-0.5">{teacherName}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
