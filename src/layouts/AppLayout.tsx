import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HamburgerMenu from "../components/HamburgerMenu";

export default function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-dvh bg-[#0e1420] text-slate-100">
      <HamburgerMenu onLogout={logout} />

      <nav className="border-b border-white/10 bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex gap-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/dashboard"
                  ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            {canViewVehicles && (
              <Link
                to="/vehicles"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/vehicles"
                    ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Vehículos
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
