import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaUserGraduate, FaChalkboardTeacher, FaSchool,
  FaBook, FaCalendarCheck, FaClipboardList, FaBullhorn, FaCalendarAlt,
  FaFileAlt, FaUserCheck, FaUserFriends, FaUsers, FaLink, FaUserTie,
  FaLevelUpAlt, FaEdit, FaSignOutAlt, FaTimes, FaChevronLeft,
  FaChevronRight, FaCog,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FaTachometerAlt },
  { label: "Students", path: "/admin/students", icon: FaUserGraduate },
  { label: "Teachers", path: "/admin/teachers", icon: FaChalkboardTeacher },
  { label: "Parents", path: "/admin/parents", icon: FaUserFriends },
  { label: "Users", path: "/admin/users", icon: FaUsers },
  { label: "Classes", path: "/admin/classes", icon: FaSchool },
  { label: "Subjects", path: "/admin/subjects", icon: FaBook },
  { label: "Class Subjects", path: "/admin/class-subjects", icon: FaLink },
  { label: "Teacher Assignments", path: "/admin/teacher-assignments", icon: FaUserTie },
  { label: "Enrollments", path: "/admin/enrollments", icon: FaUserCheck },
  { label: "Promotions", path: "/admin/promotions", icon: FaLevelUpAlt },
  { label: "Sessions", path: "/admin/sessions", icon: FaCalendarAlt },
  { label: "Terms", path: "/admin/terms", icon: FaCalendarAlt },
  { label: "Attendance", path: "/admin/attendance", icon: FaCalendarCheck },
  { label: "Timetable", path: "/admin/timetable", icon: FaCalendarAlt },
  { label: "Assessments", path: "/admin/assessments", icon: FaClipboardList },
  { label: "Mark Entries", path: "/admin/mark-entries", icon: FaEdit },
  { label: "Reports", path: "/admin/reports", icon: FaFileAlt },
  { label: "Settings", path: "/admin/settings", icon: FaCog },
  { label: "Announcements", path: "/admin/announcements", icon: FaBullhorn },
];

const activeStyle = { backgroundColor: "rgba(249,115,22,1)", color: "#ffffff" };
const inactiveStyle = { color: "rgba(255,255,255,0.65)" };

export default function Sidebar({ mobileOpen, onToggleMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onToggleMobile?.(false);
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && onToggleMobile) onToggleMobile(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onToggleMobile]);

  return (
    <>
      <aside
        className={`bg-sidebar min-h-screen flex flex-col transition-all duration-300 z-40 overflow-x-hidden
          ${collapsed ? "md:w-16" : "md:w-64"}
          ${mobileOpen
            ? "fixed inset-y-0 left-0 w-64 translate-x-0"
            : "fixed inset-y-0 left-0 w-64 -translate-x-full md:relative md:translate-x-0"
          }`}
      >
        <div className="flex items-center justify-end px-3 pt-4 pb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(249,115,22,1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >
            {collapsed ? <FaChevronRight className="text-xs" /> : <FaChevronLeft className="text-xs" />}
          </button>
        </div>

        <div className="md:hidden flex items-center justify-end px-3 pb-2">
          <button
            onClick={() => onToggleMobile(false)}
            style={{ color: "rgba(255,255,255,0.6)" }}
            className="hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => onToggleMobile?.(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
                  style={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                >
                  <item.icon className="text-base min-w-4 shrink-0" />
                  {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-2 pb-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {!collapsed && (
            <div className="flex items-center justify-center gap-3 px-3 py-2 mb-1">
              <Link
                to="/privacy"
                className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Privacy
              </Link>
              <span style={{ color: "rgba(255,255,255,0.2)" }} className="text-xs">·</span>
              <Link
                to="/terms"
                className="text-xs transition-colors hover:text-white"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Terms
              </Link>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-150"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <FaSignOutAlt className="text-base min-w-4 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => onToggleMobile(false)} />
      )}
    </>
  );
}
