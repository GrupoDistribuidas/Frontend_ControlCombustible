import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Fuel, LogOut, Menu, X, Car, LayoutDashboard } from "lucide-react";

interface HamburgerMenuProps {
  onLogout?: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return { username: "Usuario", email: "usuario@ejemplo.com" };
      const parsed = JSON.parse(raw);
      return {
        username: parsed?.name || "Usuario",
        email: parsed?.email || "usuario@ejemplo.com",
      };
    } catch {
      return { username: "Usuario", email: "usuario@ejemplo.com" };
    }
  }, []);

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Panel de control" },
    { path: "/vehicles", label: "Vehículos", icon: Car, description: "Gestión de vehículos" },
  ];

  return (
    <>
      {/* ===== HEADER BONITO (altura fija 64px) ===== */}
      <header className="sticky top-0 z-[60] w-full h-16 backdrop-blur-md bg-slate-950/60 border-b border-emerald-800/30 shadow-sm shadow-emerald-500/5">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Izquierda: menú + logo */}
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa */}
            <button
              onClick={toggleMenu}
              className="relative z-50 flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-emerald-700/40 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Abrir menú"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 block w-6 h-0.5 bg-slate-100 rounded-full transition-all duration-300 ${isOpen ? "top-3 rotate-45" : "top-1"}`} />
                <span className={`absolute left-0 top-3 block w-6 h-0.5 bg-slate-100 rounded-full transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}`} />
                <span className={`absolute left-0 block w-6 h-0.5 bg-slate-100 rounded-full transition-all duration-300 ${isOpen ? "top-3 -rotate-45" : "top-5"}`} />
              </div>
            </button>

            {/* Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Fuel className="w-5 h-5 text-white" />
            </div>

            {/* Texto del sistema */}
            <div>
              <h1 className="text-lg font-bold text-emerald-400 tracking-tight">Sistema de Control de Combustible</h1>
              <p className="text-xs text-slate-400">Gestión vehicular y consumo energético</p>
            </div>
          </div>

          {/* Derecha: usuario + logout */}
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-100">{user.username}</span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 text-white flex items-center justify-center font-semibold shadow-md shadow-emerald-500/20">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={onLogout ?? (() => localStorage.clear())}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-600/40 bg-slate-900/50 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== OVERLAY (debajo del header) ===== */}
      <div
        className={`fixed left-0 right-0 bottom-0 top-16 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* ===== SIDEBAR (debajo del header) ===== */}
      <div
        className={`fixed left-0 top-16 h-[calc(100dvh-64px)] w-[85vw] max-w-80
        bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-2xl z-50
        transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Gradiente decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-lime-400/5 pointer-events-none" />

        <div className="relative flex flex-col h-full">
          {/* Opciones */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li
                    key={item.path}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className={`${isOpen ? "animate-[slideIn_0.3s_ease-out_forwards]" : ""}`}
                  >
                    <Link
                      to={item.path}
                      onClick={closeMenu}
                      className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/20 to-lime-500/20 text-white shadow-lg shadow-emerald-500/10"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-lime-500 rounded-r-full" />
                      )}

                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-br from-emerald-500 to-lime-500 shadow-lg shadow-emerald-500/20"
                            : "bg-slate-800/50 group-hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Usuario en footer */}
          <div className="p-6 border-t border-emerald-800/30">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-emerald-700/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{user.username}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default HamburgerMenu;
