import { Link, Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-[#0e1420] text-slate-100">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="font-semibold">FuelWise</Link>
          <div className="flex gap-4 text-sm">
            <Link to="/dashboard" className="hover:text-white text-slate-300">Dashboard</Link>
            <Link to="/login" className="hover:text-white text-slate-300">Salir</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
