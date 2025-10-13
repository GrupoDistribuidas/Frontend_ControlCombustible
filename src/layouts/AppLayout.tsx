import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HamburgerMenu from "../components/HamburgerMenu";

export default function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-dvh bg-[#0e1420] text-slate-100">
      <HamburgerMenu onLogout={logout} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}