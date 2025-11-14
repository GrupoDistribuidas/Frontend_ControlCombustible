import { useEffect, useState } from "react";
import {
  Users, Edit, Plus, Power, Search, X
} from "lucide-react";

import TextField from "../components/TextField";
import Button from "../components/Button";

import { usersService } from "../services/users.service";
import { ROLES } from "../services/roles.service";
import type { User } from "../types/auth";

import toast from "react-hot-toast";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData
} from "../validation/users";

import type { CreateUserRequest } from "../types/users";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<User | null>(null);

  // 🔥 FORM DATA → Partial para permitir edición sin errores TS
  const [formData, setFormData] = useState<Partial<CreateUserFormData>>({
    nombreUsuario: "",
    email: "",
    password: "",
    rolId: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [roleFilter, setRoleFilter] = useState<string>("todos");

  // ============================
  //  CARGAR USUARIOS
  // ============================
  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const data = await usersService.getUsers();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // ============================
  //  MODAL
  // ============================
  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUsuario(null);
    setFormData({
      nombreUsuario: "",
      email: "",
      password: "",
      rolId: 0,
    });
    setFormErrors({});
  };

  // ============================
  //  EDITAR USUARIO
  // ============================
  const handleEdit = (usuario: User) => {
    setEditingUsuario(usuario);

    setFormData({
      nombreUsuario: usuario.nombreUsuario,
      email: usuario.email,
      password: "", // contraseña no obligatoria en edición
      rolId: usuario.rolId,
      choferId: usuario.choferId,
    });

    openModal();
  };

  // ============================
  //  CAMBIAR ESTADO
  // ============================
  const handleToggleEstado = async (usuario: User) => {
    try {
      await usersService.updateUserStatus(usuario.id!, usuario.estado === 1 ? 0 : 1);
      loadUsuarios();
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al cambiar estado");
    }
  };



  // ============================
  //  SUBMIT FORMULARIO
  // ============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const schema = editingUsuario ? updateUserSchema : createUserSchema;
      let validated = schema.parse(formData);

      // Si estamos editando: quitar password vacío o undefined
      if (editingUsuario) {
        if (!validated.password || validated.password.trim() === "") {
          delete (validated as any).password;
        }
      }

      if (editingUsuario) {
        await usersService.updateUser(editingUsuario.id!, validated);
        toast.success("Usuario actualizado correctamente");
      } else {
        await usersService.createUser(validated as CreateUserRequest);
        toast.success("Usuario creado correctamente");
      }

      await loadUsuarios();
      closeModal();
    } catch (error: any) {

      if (error.name === "ZodError") {
        if (Array.isArray(error.issues)) {
          error.issues.forEach((issue: any) => {
            toast.error(issue.message);
            setFormErrors(prev => ({
              ...prev,
              [issue.path[0]]: issue.message
            }));
          });
        }
        return;
      }

      let errorMessage = "Error al guardar usuario";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      else if (Array.isArray(error?.response?.data)) {
        errorMessage = error.response.data[0]?.message || errorMessage;
      }

      else if (typeof error?.response?.data === "string") {
        errorMessage = error.response.data;
      }

      else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }finally {
      setSubmitting(false);
    }

  };

  // ============================
  //  INPUT HANDLER
  // ============================
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // ============================
  //  FILTROS
  // ============================
  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = searchTerm === "" ||
      usuario.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "todos" ||
      (statusFilter === "activo" && usuario.estado === 1) ||
      (statusFilter === "inactivo" && usuario.estado === 0);

    const matchesRole = roleFilter === "todos" ||
      usuario.rolId?.toString() === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // ============================
  // RENDER
  // ============================
  return (
    <div className="mx-auto max-w-6xl px-8 py-12">

      {/* HEADER */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
            <Users className="text-emerald-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-emerald-400">Gestión de Usuarios</h1>
            <p className="text-slate-400">Administra los usuarios del sistema.</p>
          </div>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 h-10 text-white font-semibold bg-gradient-to-r from-emerald-500 to-lime-500 rounded-lg shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <TextField
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-700 focus:border-blue-500 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
        >
          <option value="todos">Todos los roles</option>
          <option value={ROLES.ADMINISTRADOR.id.toString()}>{ROLES.ADMINISTRADOR.name}</option>
          <option value={ROLES.SUPERVISOR.id.toString()}>{ROLES.SUPERVISOR.name}</option>
          <option value={ROLES.OPERADOR.id.toString()}>{ROLES.OPERADOR.name}</option>
        </select>
        <div className="flex items-center">
          <Button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("todos");
              setRoleFilter("todos");
            }}
            className="
              flex items-center gap-2
              px-4 py-2 rounded-lg
              bg-gradient-to-r from-green-500 to-emerald-600
              text-white font-semibold shadow-md
              hover:brightness-110 hover:scale-105
              transition-all duration-150
              w-fit
            "
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        {/* Tabla de Usuarios */}
        <div className="rounded-2xl border border-white/10 p-8 shadow-2xl shadow-emerald-500/5">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">Lista de Usuarios</h2>
          {loadingUsuarios ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="mt-2 text-slate-400">Cargando usuarios...</p>
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {usuarios.length === 0
                  ? "No hay usuarios registrados"
                  : "No se encontraron usuarios que coincidan con los filtros aplicados"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Rol</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                        <td className="px-6 py-4 text-slate-200">{usuario.nombreUsuario}</td>
                        <td className="px-6 py-4 text-slate-300">{usuario.email}</td>
                        <td className="px-6 py-4 text-slate-300">{usuario.rolNombre}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleEstado(usuario)}
                            className={`flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium transition-colors ${usuario.estado === 1
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                              }`}
                            title={usuario.estado === 1 ? "Desactivar usuario" : "Activar usuario"}
                          >
                            <Power className={`w-3 h-3 ${usuario.estado === 1 ? "text-blue-400" : "text-gray-400"}`} />
                            {usuario.estado === 1 ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(usuario)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Información de resultados */}
              <div className="mt-4 text-sm text-slate-400 text-center">
                Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-950 w-full max-w-md rounded-2xl p-6 border border-slate-800">

            <h2 className="text-xl font-bold text-emerald-400 mb-6">
              {editingUsuario ? "Editar Usuario" : "Crear Usuario"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <label className="text-sm text-slate-300">Nombre de Usuario</label>
                <TextField
                  value={formData.nombreUsuario || ""}
                  onChange={e => handleInputChange("nombreUsuario", e.target.value)}
                  className={formErrors.nombreUsuario ? "border-red-500" : ""}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Email</label>
                <TextField
                  value={formData.email || ""}
                  onChange={e => handleInputChange("email", e.target.value)}
                  className={formErrors.email ? "border-red-500" : ""}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">
                  {editingUsuario ? "Nueva Contraseña (opcional)" : "Contraseña"}
                </label>
                <TextField
                  type="password"
                  value={formData.password || ""}
                  onChange={e => handleInputChange("password", e.target.value)}
                  className={formErrors.password ? "border-red-500" : ""}
                  placeholder={editingUsuario ? "Dejar vacío para mantener la actual" : ""}
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Rol</label>
                <select
                  value={formData.rolId || 0}
                  onChange={e => handleInputChange("rolId", Number(e.target.value))}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-200"
                >
                  <option value={0}>Seleccione un rol</option>
                  <option value={ROLES.ADMINISTRADOR.id}>{ROLES.ADMINISTRADOR.name}</option>
                  <option value={ROLES.SUPERVISOR.id}>{ROLES.SUPERVISOR.name}</option>
                  <option value={ROLES.OPERADOR.id}>{ROLES.OPERADOR.name}</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-slate-700 text-white px-4 py-2"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 text-white px-4 py-2"
                >
                  {submitting ? "Guardando..." : editingUsuario ? "Actualizar" : "Crear"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
