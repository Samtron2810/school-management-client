import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaBook,
  FaCalendarCheck,
  FaClipboardList,
  FaBullhorn,
  FaCalendarAlt,
  FaFileAlt,
  FaUserCheck,
  FaUserFriends,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FaTachometerAlt },
  { label: "Students", path: "/admin/students", icon: FaUserGraduate },
  { label: "Teachers", path: "/admin/teachers", icon: FaChalkboardTeacher },
  { label: "Classes", path: "/admin/classes", icon: FaSchool },
  { label: "Subjects", path: "/admin/subjects", icon: FaBook },
  { label: "Attendance", path: "/admin/attendance", icon: FaCalendarCheck },
  { label: "Assessments", path: "/admin/assessments", icon: FaClipboardList },
  { label: "Announcements", path: "/admin/announcements", icon: FaBullhorn },
  { label: "Sessions", path: "/admin/sessions", icon: FaCalendarAlt },
  { label: "Reports", path: "/admin/reports", icon: FaFileAlt },
  { label: "Enrollments", path: "/admin/enrollments", icon: FaUserCheck },
  { label: "Parents", path: "/admin/parents", icon: FaUserFriends },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-sidebar min-h-screen flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Branding */}
      <div className="flex items-center justify-center h-16 border-b border-white/20">
        {!collapsed && (
          <h1 className="text-xl font-bold">
            <span className="text-primary">Tron</span>
            <span className="text-electric-blue">School</span>
          </h1>
        )}
        {collapsed && (
          <h1 className="text-xl font-bold">
            <span className="text-primary">T</span>
            <span className="text-electric-blue">S</span>
          </h1>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-slate-gray hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <item.icon className="text-lg min-w-5" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-white/20">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg bg-royal-blue text-white hover:bg-royal-blue/80 transition-colors"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
    </aside>
  );
}
