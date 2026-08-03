import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
  FaBars,
} from "react-icons/fa";
import logo from "../../assets/logos/Tronschool-logo.png";
import useAuth from "../../hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Header({ onToggleMobile }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    const role = user?.role?.toLowerCase() || "admin";
    navigate(`/${role}/profile`);
  };

  const roleTitle = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Admin";
  const userName = user?.name || user?.email || "Jane Doe";

  return (
    <header className="bg-header h-16 flex items-center justify-between px-6 gap-4">
      {/* Branding + Hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
          aria-label="Toggle Navigation Menu"
        >
          <FaBars className="text-xl text-white" />
        </button>
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Tronschool Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold hidden md:block tracking-wide">
            <span className="text-white">Tron</span>
            <span className="text-coral font-bold">School</span>
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <NotificationBell />

        {/* Profile Dropdown — original style */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
          >
            <FaUserCircle className="text-2xl" />
            <span
              className="text-sm font-medium truncate max-w-45"
              title={`${roleTitle}: ${userName}`}
            >
              {`${roleTitle}: ${userName}`}
            </span>
            <FaChevronDown
              className={`text-xs transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleProfile}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-gray hover:bg-gray-100 transition-colors"
              >
                <FaUserCircle className="text-lg" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
