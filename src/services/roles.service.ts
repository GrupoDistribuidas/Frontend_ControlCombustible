export const ROLES = {
  ADMIN: { id: 1, name: "Administrador" },
  SUPERVISOR: { id: 2, name: "Supervisor" },
  OPERADOR: { id: 3, name: "Operador" },
};

export function getRolNombre(rol?: string | null, rolId?: number | string | null): string {
  const id = rolId !== undefined && rolId !== null && rolId !== "" ? Number(rolId) : undefined;
  if (rol === ROLES.ADMIN.name || id === ROLES.ADMIN.id) return ROLES.ADMIN.name;
  if (rol === ROLES.SUPERVISOR.name || id === ROLES.SUPERVISOR.id) return ROLES.SUPERVISOR.name;
  if (rol === ROLES.OPERADOR.name || id === ROLES.OPERADOR.id) return ROLES.OPERADOR.name;
  if (rol) return rol;
  if (id) return `RolId: ${id}`;
  return "Sin rol";
}

export function hasRole(user: any, role: keyof typeof ROLES): boolean {
  const nombre = getRolNombre(user?.role, user?.rolId ?? user?.roleId ?? user?.RolId ?? user?.idRol);
  return nombre === ROLES[role].name;
}
