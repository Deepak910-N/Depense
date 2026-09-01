import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiHome, HiPlusCircle, HiClipboardList, HiRefresh, HiCog } from "react-icons/hi";

const navItems = [
  { path: "/", label: "Dashboard", icon: HiHome },
  { path: "/add", label: "Add", icon: HiPlusCircle },
  { path: "/expenses", label: "Expenses", icon: HiClipboardList },
  { path: "/recurring", label: "Recurring", icon: HiRefresh },
  { path: "/settings", label: "Settings", icon: HiCog },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              Dépense
            </Link>
          </div>

          {/* Nav links — desktop */}
          <div className="hidden sm:flex sm:items-center sm:space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                  active ? "text-primary-600" : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
