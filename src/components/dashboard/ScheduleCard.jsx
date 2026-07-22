const scheduleData = [
  { time: "08:00 AM", subject: "Mathematics 101", room: "Room A" },
  { time: "09:30 AM", subject: "English Literature", room: "Room B" },
  { time: "11:00 AM", subject: "Physics Lab", room: "Lab 1" },
  { time: "12:30 PM", subject: "Lunch Break", room: "-" },
  { time: "02:00 PM", subject: "Computer Science", room: "Lab 2" },
];

export default function ScheduleCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Today's Schedule
      </h3>

      {/* Calendar Date */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-light-blue">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-gray uppercase">Wed</span>
          <span className="text-2xl font-bold text-royal-blue bg-royal-blue/10 w-10 h-10 flex items-center justify-center rounded-full">
            12
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-primary">
            Wednesday, July 2026
          </p>
          <p className="text-xs text-slate-gray">5 sessions scheduled</p>
        </div>
      </div>

      {/* Schedule List */}
      <ul className="space-y-2">
        {scheduleData.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-light-blue"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-royal-blue w-16">
                {item.time}
              </span>
              <div>
                <p className="text-sm font-medium text-primary">
                  {item.subject}
                </p>
                <p className="text-xs text-slate-gray">{item.room}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
