import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import logo from "../../assets/logos/Tronschool-logo.png";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-header h-16 flex items-center justify-between px-6 gap-4">
      {/* Branding + Spacer for mobile toggle */}
      <div className="flex items-center gap-3">
        {/* Spacer for mobile hamburger button (fixed position) */}
        <div className="w-10 md:hidden" />
        <img src={logo} alt="Tronschool Logo" className="h-8 w-auto" />
        <h1 className="text-xl font-bold hidden md:block">
          <span className="text-primary">Tron</span>
          <span className="text-electric-blue">School</span>
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
          >
            <FaUserCircle className="text-2xl" />
            <span className="text-sm font-medium">Admin: Jane Doe</span>
            <FaChevronDown
              className={`text-xs transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-gray hover:bg-gray-100 transition-colors"
              >
                <FaUserCircle className="text-lg" />
                Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  // TODO: Replace with modal confirmation
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-crimson hover:bg-red-50 transition-colors"
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
