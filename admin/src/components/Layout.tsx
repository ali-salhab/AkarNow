import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "لوحة التحكم",
  "/properties": "العقارات",
  "/users": "المستخدمون",
  "/cities": "المدن",
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "Admin";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 animate-fadeInDown">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
            النظام متصل
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
