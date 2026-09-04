import { Link, useLocation } from "react-router-dom";
import { HiHome, HiPlusCircle, HiClipboardList, HiRefresh, HiCog } from "react-icons/hi";

const navItems = [
  { path: "/", label: "Home", icon: HiHome },
  { path: "/expenses", label: "History", icon: HiClipboardList },
  { path: "/add", label: "Add", icon: HiPlusCircle, accent: true },
  { path: "/recurring", label: "Recurring", icon: HiRefresh },
  { path: "/settings", label: "Settings", icon: HiCog },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-t border-gray-200 pb-safe shrink-0">
      <div className="flex justify-around items-end pt-1.5 pb-1">
        {navItems.map(({ path, label, icon: Icon, accent }) => {
          const active = location.pathname === path;
          if (accent) {
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center -mt-5"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  active ? "bg-primary-600" : "bg-primary-500"
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] mt-0.5 text-primary-600 font-medium">{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                active ? "text-primary-600" : "text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
