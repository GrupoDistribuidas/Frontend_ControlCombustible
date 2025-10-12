import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasRole } from "../services/roles.service";

export default function AppLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const canViewVehicles = hasRole(user, "ADMINISTRADOR") || hasRole(user, "SUPERVISOR");

  return (
    <div className="min-h-dvh bg-[#0e1420] text-slate-100">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-semibold">FuelWise</span>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300">{user?.name}</span>
            <button
              onClick={logout} // 🔹 cierra sesión
              className="text-slate-300 hover:text-white"
            >
              Salir
            </button>
          </div>
        </nav>
      </header>

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
