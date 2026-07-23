import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaCalendarCheck,
  FaClipboardCheck,
  FaBullhorn,
  FaSignOutAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

const navItems = [
  { label: "Dashboard", path: "/parent/dashboard", icon: FaTachometerAlt },
  { label: "My Children", path: "/parent/children", icon: FaUserGraduate },
  {
    label: "Child's Assessments",
    path: "/parent/child-assessments",
    icon: FaClipboardCheck,
  },
  {
    label: "Child's Attendance",
    path: "/parent/child-attendance",
    icon: FaCalendarCheck,
  },
  {
    label: "Child's Report Cards",
    path: "/parent/child-report-cards",
    icon: FaClipboardCheck,
  },
  {
    label: "Child's Results",
    path: "/parent/child-results",
    icon: FaClipboardCheck,
  },
  { label: "Announcements", path: "/parent/announcements", icon: FaBullhorn },
];

export default function ParentSidebar({ mobileOpen, onToggleMobile }) {
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
      if (window.innerWidth >= 768 && onToggleMobile) {
        onToggleMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onToggleMobile]);

  return (
    <>
      <aside
        className={`bg-sidebar min-h-screen flex flex-col transition-all duration-300 z-40 overflow-x-hidden
          ${collapsed ? "md:w-16" : "md:w-64"}
          ${
            mobileOpen
              ? "fixed inset-y-0 left-0 w-64 translate-x-0"
              : "fixed inset-y-0 left-0 w-64 -translate-x-full md:relative md:translate-x-0"
          }`}
      >
        {/* Toggle Button - top of sidebar, above navlinks */}
        <div className="flex items-center justify-end px-3 pt-4 pb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-royal-blue text-white hover:bg-royal-blue/80 transition-colors"
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-end px-3 pb-2">
          <button
            onClick={() => onToggleMobile(false)}
            className="text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => onToggleMobile?.(false)}
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

        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-crimson hover:bg-white/10 hover:text-crimson transition-colors"
          >
            <FaSignOutAlt className="text-lg min-w-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => onToggleMobile(false)}
        />
      )}
    </>
  );
}
