import { useAuth } from "../context/AuthContext";
import VisibleIf from "../components/VisibleIf";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-300">Bienvenido. Aquí irá el contenido de la app.</p>
      <VisibleIf condition={user?.role === "admin"}>
        <div className="mt-4 p-4 rounded bg-emerald-900/20 text-emerald-300">
          Solo visible para administradores.
        </div>
      </VisibleIf>
    </div>
  );
}
