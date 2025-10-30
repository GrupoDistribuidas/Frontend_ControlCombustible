import { useEffect, useState, useMemo } from "react";
import { User, Edit, Plus, Power, CheckCircle, XCircle, UserPlus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

import ChoferModal from "../components/ChoferModal";
import AssignUserModal from "../components/AssignUserModal";
import TextField from "../components/TextField";
import Button from "../components/Button";

import { choferesService } from "../services/choferes.service";
import { vehiclesService } from "../services/vehicles.service";
import type { Chofer } from "../types/drivers";
import type { TipoMaquinaria } from "../validation/vehicles";

export default function Choferes() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([]);
  const [loadingChoferes, setLoadingChoferes] = useState(true);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChofer, setEditingChofer] = useState<Chofer | null>(null);
  const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);
  const [assigningChofer, setAssigningChofer] = useState<Chofer | null>(null);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [selectedDisponibilidad, setSelectedDisponibilidad] = useState<"todos" | "disponible" | "no_disponible">("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // map de tipos
  const tiposMap = useMemo(() => {
    const map = new Map<number, string>();
    tipos.forEach((t) => map.set(t.id, t.nombre));
    return map;
  }, [tipos]);

  // Filtro y búsqueda
  const filteredChoferes = useMemo(() => {
    const term = (searchTerm ?? "").toLowerCase().trim();
    return choferes.filter((chofer) => {
      const fullName = `${chofer.primerNombre} ${chofer.segundoNombre || ""} ${chofer.primerApellido} ${chofer.segundoApellido || ""}`.toLowerCase().trim();
      const identificacion = String(chofer.identificacion ?? "").toLowerCase();

      const matchesSearch =
        term === "" ||
        fullName.includes(term) ||
        identificacion.includes(term);

      const matchesEstado =
        selectedEstado === "todos" ||
        (selectedEstado === "activo" && chofer.estado) ||
        (selectedEstado === "inactivo" && !chofer.estado);

      const matchesDisponibilidad =
        selectedDisponibilidad === "todos" ||
        (selectedDisponibilidad === "disponible" && chofer.disponible) ||
        (selectedDisponibilidad === "no_disponible" && !chofer.disponible);

      return matchesSearch && matchesEstado && matchesDisponibilidad;
    });
  }, [choferes, searchTerm, selectedEstado, selectedDisponibilidad]);

  // Paginación
  const totalPages = Math.ceil(filteredChoferes.length / itemsPerPage);
  const paginatedChoferes = filteredChoferes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedEstado("todos");
    setSelectedDisponibilidad("todos");
    setCurrentPage(1);
  };

  // Cargar Tipos
  useEffect(() => {
    (async () => {
      try {
        setLoadingTipos(true);
        const data = await vehiclesService.getTipos();
        setTipos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("No se pudieron cargar los tipos de maquinaria");
      } finally {
        setLoadingTipos(false);
      }
    })();
  }, []);

  // Cargar Choferes
  useEffect(() => {
    loadChoferes();
  }, []);

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEstado, selectedDisponibilidad]);

  // Cargar filtros desde sessionStorage
  useEffect(() => {
    const savedFilters = sessionStorage.getItem("choferesFilters");
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSearchTerm(filters.searchTerm || "");
        setSelectedEstado(filters.selectedEstado || "todos");
        setSelectedDisponibilidad(filters.selectedDisponibilidad || "todos");
        setCurrentPage(filters.currentPage || 1);
      } catch (e) {
        console.error("Error loading filters from sessionStorage:", e);
      }
    }
  }, []);

  // Guardar filtros en sessionStorage
  useEffect(() => {
    const filters = {
      searchTerm,
      selectedEstado,
      selectedDisponibilidad,
      currentPage,
    };
    sessionStorage.setItem("choferesFilters", JSON.stringify(filters));
  }, [searchTerm, selectedEstado, selectedDisponibilidad, currentPage]);

  const loadChoferes = async () => {
    try {
      setLoadingChoferes(true);
      const data = await choferesService.getChoferes();
      setChoferes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("No se pudieron cargar los choferes");
    } finally {
      setLoadingChoferes(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingChofer(null);
  };

  const openAssignUserModal = (chofer: Chofer) => {
    setAssigningChofer(chofer);
    setIsAssignUserModalOpen(true);
  };

  const closeAssignUserModal = () => {
    setIsAssignUserModalOpen(false);
    setAssigningChofer(null);
  };

  const handleEdit = (chofer: Chofer) => {
    setEditingChofer(chofer);
    openModal();
  };

  const handleToggleEstado = async (chofer: Chofer) => {
    try {
      await choferesService.updateChoferEstado(chofer.id, !chofer.estado);
      loadChoferes();
    } catch (e: any) {
      console.error("Error al cambiar estado del chofer:", e);
    }
  };

  const handleToggleDisponibilidad = async (chofer: Chofer) => {
    try {
      await choferesService.updateChoferDisponibilidad(chofer.id, !chofer.disponible);
      loadChoferes();
    } catch (e: any) {
      console.error("Error al cambiar disponibilidad del chofer:", e);
    }
  };

  const handleAsignarUsuario = (chofer: Chofer) => {
    openAssignUserModal(chofer);
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado + Acciones (botón compacto, no estirado) */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
            <User className="text-emerald-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">
              Registro de Choferes
            </h1>
            <p className="text-slate-400">
              Crea un nuevo chofer manteniendo el inventario de personal de tu flota.
            </p>
          </div>
        </div>

        {/* Botón NUEVO CHOFER — compacto, cuadrado y en un solo lugar */}
        <button
          onClick={openModal}
          className="
            inline-flex w-auto items-center gap-2
            rounded-lg px-4 h-10
            bg-gradient-to-r from-emerald-500 to-lime-500
            text-white font-semibold
            shadow-lg shadow-emerald-500/20
            hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
            transition
          "
          title="Agregar nuevo chofer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Chofer</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <TextField
              placeholder="Buscar por nombre o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-700 focus:border-blue-500 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value as "todos" | "activo" | "inactivo")}
          className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
        <select
          value={selectedDisponibilidad}
          onChange={(e) => setSelectedDisponibilidad(e.target.value as "todos" | "disponible" | "no_disponible")}
          className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
        >
          <option value="todos">Todas las disponibilidades</option>
          <option value="disponible">Disponible</option>
          <option value="no_disponible">No disponible</option>
        </select>
        <div className="flex items-center">
          <Button
            onClick={handleClearFilters}
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
        {/* Tabla de Choferes */}
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-emerald-500/5">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">Lista de Choferes</h2>
          {loadingChoferes ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="mt-2 text-slate-400">Cargando choferes...</p>
            </div>
          ) : filteredChoferes.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {choferes.length === 0
                  ? "No hay choferes registrados"
                  : "No se encontraron choferes que coincidan con los filtros aplicados"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3">Nombre Completo</th>
                      <th className="px-6 py-3">Identificación</th>
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3">Tipo Maquinaria</th>
                      <th className="px-6 py-3">Disponible</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedChoferes.map((chofer) => (
                      <tr key={chofer.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                        <td className="px-6 py-4 text-slate-200">
                          {chofer.primerNombre} {chofer.segundoNombre} {chofer.primerApellido} {chofer.segundoApellido}
                        </td>
                        <td className="px-6 py-4 text-slate-300">{chofer.identificacion}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {chofer.usuario ? chofer.usuario.nombreUsuario : "Sin asignar"}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {tiposMap.get(chofer.tipoMaquinariaId) ?? "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleDisponibilidad(chofer)}
                            className={`flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium transition-colors ${chofer.disponible
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              }`}
                            title={chofer.disponible ? "Marcar como no disponible" : "Marcar como disponible"}
                          >
                            {chofer.disponible ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            {chofer.disponible ? "Disponible" : "No disponible"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleEstado(chofer)}
                            className={`flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium transition-colors ${chofer.estado
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                              }`}
                            title={chofer.estado ? "Desactivar chofer" : "Activar chofer"}
                          >
                            <Power className={`w-3 h-3 ${chofer.estado ? "text-blue-400" : "text-gray-400"}`} />
                            {chofer.estado ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(chofer)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!chofer.usuarioId && (
                              <button
                                onClick={() => handleAsignarUsuario(chofer)}
                                className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
                                title="Asignar usuario"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between px-6 pb-6">
                  <p className="text-sm text-slate-400">
                    Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredChoferes.length)} a{" "}
                    {Math.min(currentPage * itemsPerPage, filteredChoferes.length)} de {filteredChoferes.length} choferes
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-200">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal del Formulario */}
        <ChoferModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingChofer={editingChofer}
          onSuccess={() => {
            loadChoferes();
            closeModal();
          }}
        />

        {/* Modal para asignar usuario */}
        <AssignUserModal
          isOpen={isAssignUserModalOpen}
          onClose={closeAssignUserModal}
          chofer={assigningChofer}
          onSuccess={() => {
            loadChoferes();
            closeAssignUserModal();
          }}
        />
      </div>

      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>
    </div>
  );
}
