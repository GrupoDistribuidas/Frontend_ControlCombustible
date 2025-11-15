import { useEffect, useState, useMemo } from "react";
import {
  Route,
  Edit,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

import TextField from "../components/TextField";
import AsignacionModal from "../components/AsignacionModal";

import { asignacionesService } from "../services/asignaciones.service";
import { rutasService } from "../services/rutas.service";
import { choferesService } from "../services/choferes.service";
import { vehiclesService } from "../services/vehicles.service";
import type { Asignacion, Ruta, Chofer, Vehicle } from "../types/asignaciones";

const getNombreCompleto = (chofer: Chofer) =>
  `${chofer.primerNombre} ${chofer.segundoNombre || ""} ${chofer.primerApellido} ${chofer.segundoApellido || ""}`.trim();

const estadoMap: Record<number, string> = {
  1: "Asignada",
  2: "En Proceso",
  3: "Completada",
  4: "Cancelada",
  5: "Pausada"
};



export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehicle[]>([]);
  // const [estadosAsignacion, setEstadosAsignacion] = useState<EstadoAsignacion[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<Asignacion | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [selectedFecha, setSelectedFecha] = useState<string>("");
  const [selectedChofer, setSelectedChofer] = useState<number | "">("");
  const [selectedVehiculo, setSelectedVehiculo] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [asigs, rutasData, choferesData, vehiculosData] = await Promise.all([
        asignacionesService.getAsignaciones(),
        rutasService.getAllRutas(),
        choferesService.getChoferes(),
        vehiclesService.getVehicles(),
      ]);
      const asignacionesCompletas = (Array.isArray(asigs) ? asigs : []).map((a: any) => ({
        ...a,
        ruta: rutasData.find((r: Ruta) => r.id === a.rutaId),
        chofer: choferesData.find((c: Chofer) => c.id === a.choferId),
        vehiculo: vehiculosData.find((v: Vehicle) => v.id === a.vehiculoId),
      }));
      setAsignaciones(asignacionesCompletas);
      setRutas(Array.isArray(rutasData) ? rutasData : []);
      setChoferes(Array.isArray(choferesData) ? choferesData : []);
      setVehiculos(Array.isArray(vehiculosData) ? vehiculosData : []);
    } catch (err) {
      console.error("Error al cargar asignaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return asignaciones.filter((a) => {
      const ruta = a.ruta?.nombre?.toLowerCase() || "";
      const chofer = a.chofer ? getNombreCompleto(a.chofer).toLowerCase() : "";
      const vehiculo = a.vehiculo?.nombre?.toLowerCase() || "";

      const matchesTerm = !term || ruta.includes(term) || chofer.includes(term) || vehiculo.includes(term);
      const matchesEstado =
        selectedEstado === "todos" ||
        (selectedEstado === "activo" && a.estado) ||
        (selectedEstado === "inactivo" && !a.estado);
      const matchesFecha =
        selectedFecha === "" ||
        (a.fechaAsignacion &&
          new Date(a.fechaAsignacion).toISOString().split("T")[0] === selectedFecha);
      const matchesChofer = selectedChofer === "" || a.choferId === Number(selectedChofer);
      const matchesVehiculo = selectedVehiculo === "" || a.vehiculoId === Number(selectedVehiculo);

      return matchesTerm && matchesEstado && matchesFecha && matchesChofer && matchesVehiculo;
    });
  }, [
    asignaciones,
    searchTerm,
    selectedEstado,
    selectedFecha,
    selectedChofer,
    selectedVehiculo,
  ]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedEstado("todos");
    setSelectedFecha("");
    setSelectedChofer("");
    setSelectedVehiculo("");
    setCurrentPage(1);
  };

  const handleEdit = (a: Asignacion) => {
    setEditingAsignacion(a);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAsignacion(null);
    setIsModalOpen(true);
  };

  const handleChangeEstado = async (id: number, nuevoEstado: string) => {
    try {
      await asignacionesService.updateEstadoAsignacion(id, nuevoEstado);
      await loadData();
      toast.success("Estado de asignación actualizado correctamente");
    } catch (e: any) {
      let msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.response?.data?.detail ||
        e?.message ||
        "Error al cambiar el estado de la asignación";
      if (msg.toLowerCase().includes("no puede cambiar")) {
        msg = "No es posible cambiar a ese estado desde el estado actual.";
      } else if (msg.toLowerCase().includes("fecha")) {
        msg = "Falta la fecha o la fecha no es válida.";
      } else if (msg.toLowerCase().includes("no permitido")) {
        msg = "Cambio de estado no permitido.";
      } else if (msg.toLowerCase().includes("no válido")) {
        msg = "El estado seleccionado no es válido.";
      } else if (msg.toLowerCase().includes("no existe")) {
        msg = "El estado seleccionado no existe.";
      } else if (msg.toLowerCase().includes("error interno")) {
        msg = "Error interno del servidor. Contacte al administrador.";
      }
      toast.error(msg);
      console.error("Error al cambiar estado de asignación:", e);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAsignacion(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado con botón a la derecha */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <Route className="text-blue-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-400">
              Asignaciones
            </h1>
            <p className="text-slate-400">
              Gestión de rutas asignadas a choferes y vehículos del sistema.
            </p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg px-4 h-10
                     bg-gradient-to-r from-blue-500 to-cyan-500
                     text-white font-semibold shadow-lg shadow-blue-500/20
                     hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50
                     transition"
          title="Agregar nueva asignación"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Asignación</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64 relative">
          <TextField
            placeholder="Buscar por ruta, chofer o vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900/60 border border-slate-700 focus:border-blue-500 pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <div className="min-w-48">
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value as "todos" | "activo" | "inactivo")}
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 transition-all"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <div className="min-w-48">
          <input
            type="date"
            value={selectedFecha}
            onChange={(e) => setSelectedFecha(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 transition-all"
          />
        </div>

        <button
          onClick={handleClearFilters}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md
                     bg-gradient-to-r from-emerald-500 to-green-600
                     text-white text-sm font-semibold shadow-md
                     hover:brightness-110 hover:scale-105
                     active:scale-95 transition-all duration-150"
          title="Limpiar filtros"
        >
          <X className="w-4 h-4" />
          <span>Limpiar</span>
        </button>
      </div>

            {/* Tabla */}
      <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-blue-500/5">
        <h2 className="text-2xl font-bold text-slate-200 mb-6">
          Lista de Asignaciones
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-slate-400">Cargando asignaciones...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {asignaciones.length === 0
                ? "No hay asignaciones registradas"
                : "No se encontraron resultados con los filtros aplicados"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3">Ruta</th>
                    <th className="px-6 py-3">Chofer</th>
                    <th className="px-6 py-3">Vehículo</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => (
                    <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-slate-200">
                        {a.ruta?.nombre || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {a.chofer ? getNombreCompleto(a.chofer) : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {a.vehiculo?.nombre || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {a.fechaAsignacion
                          ? new Date(a.fechaAsignacion).toLocaleDateString("es-ES")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={estadoMap[(a as any).estadoId] || "Asignada"}
                          onChange={(e) => handleChangeEstado(a.id, e.target.value)}
                          disabled={(a as any).estadoId === 3 || (a as any).estadoId === 4}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all ${
                            (a as any).estadoId === 3 || (a as any).estadoId === 4
                              ? "bg-slate-700 border-slate-500 text-slate-400 cursor-not-allowed"
                              : "bg-slate-800 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          }`}
                        >
                          <option value="Asignada">Asignada</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Completada">Completada</option>
                          <option value="Cancelada">Cancelada</option>
                          <option value="Pausada">Pausada</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(a)}
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between px-6 pb-6">
                <p className="text-sm text-slate-400">
                  Mostrando{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filtered.length
                  )}{" "}
                  a{" "}
                  {Math.min(currentPage * itemsPerPage, filtered.length)} de{" "}
                  {filtered.length} asignaciones
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
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

      {/* Modal */}
      <AsignacionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingAsignacion={editingAsignacion}
        rutas={rutas}
        choferes={choferes}
        vehiculos={vehiculos}
        onSuccess={() => {
          loadData();
          closeModal();
        }}
      />

      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>
    </div>
  );
}
