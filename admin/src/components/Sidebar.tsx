import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  MapPin,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { to: "/properties", icon: Building2, label: "العقارات" },
  { to: "/users", icon: Users, label: "المستخدمون" },
  { to: "/cities", icon: MapPin, label: "المدن" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-primary-600 text-white animate-fadeIn">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-700 animate-fadeInDown">
        <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
          <img
            src="/icon.png"
            alt="AqarNow"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-bold text-base leading-tight">عقارنو</p>
          <p className="text-xs text-primary-100 font-medium">لوحة المشرف</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }, i) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group animate-slideInRight delay-${(i + 1) * 100} ${
                isActive
                  ? "bg-white/15 text-white shadow-sm scale-[1.02]"
                  : "text-primary-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-accent" : ""} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronLeft size={14} className="text-accent" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-primary-700 animate-fadeInUp">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-xs font-bold uppercase">
            {user?.name?.[0] || "م"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.name || "المشرف"}
            </p>
            <p className="text-xs text-primary-200 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary-100 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
