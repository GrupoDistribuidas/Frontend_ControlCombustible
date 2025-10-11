import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { logout, user } = useAuth();
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

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
