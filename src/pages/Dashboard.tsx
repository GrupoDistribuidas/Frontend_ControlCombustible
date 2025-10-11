import { useAuth } from "../context/AuthContext";
import VisibleIf from "../components/VisibleIf";
import { getRolNombre, hasRole, ROLES } from "../services/roles.service";

export default function Dashboard() {
  const { user } = useAuth();

  const rolNombre = getRolNombre(
    user?.role,
    (user as any)?.rolId ?? (user as any)?.roleId ?? (user as any)?.RolId ?? (user as any)?.idRol
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-300">Bienvenido. Aquí irá el contenido de la app.</p>
      <div className="mt-2 text-slate-400">
        Rol actual: {rolNombre}
      </div>
      <VisibleIf condition={hasRole(user, "ADMIN")}>
        <div className="mt-4 p-4 rounded bg-emerald-900/20 text-emerald-300">
          Solo visible para administradores.
        </div>
      </VisibleIf>
      <VisibleIf condition={hasRole(user, "SUPERVISOR")}>
        <div className="mt-4 p-4 rounded bg-blue-900/20 text-blue-300">
          Solo visible para supervisores.
        </div>
      </VisibleIf>
      <VisibleIf condition={hasRole(user, "OPERADOR")}>
        <div className="mt-4 p-4 rounded bg-yellow-900/20 text-yellow-300">
          Solo visible para operadores.
        </div>
      </VisibleIf>
    </div>
  );
}
