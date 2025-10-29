import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HamburgerMenu from "../components/HamburgerMenu";
import { Toaster } from "react-hot-toast";

export default function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-dvh bg-[#0e1420] text-slate-100">
      <HamburgerMenu onLogout={logout} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
    </div>
  );
}