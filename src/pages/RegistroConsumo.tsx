import { useEffect, useState, useMemo } from "react";
import {
  Fuel,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calculator,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from "lucide-react";

import TextField from "../components/TextField";
import RegistroConsumoModal from "../components/RegistroConsumoModal";

import { registroConsumoService } from "../services/registro-consumo.service";
import { asignacionesService } from "../services/asignaciones.service";
import { rutasService } from "../services/rutas.service";
import { choferesService } from "../services/choferes.service";
import { vehiclesService } from "../services/vehicles.service";
import type {
  RegistroConsumo,
  AsignacionConDetalles,
} from "../types/registro-consumo";

const getNombreCompleto = (chofer: any) =>
  `${chofer?.primerNombre || ""} ${chofer?.segundoNombre || ""} ${
    chofer?.primerApellido || ""
  } ${chofer?.segundoApellido || ""}`.trim();

const estadoMap: Record<number, string> = {
  1: "Pendiente",
  2: "Completado",
  3: "Cancelado",
};

export default function RegistroConsumo() {
  const [registros, setRegistros] = useState<RegistroConsumo[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionConDetalles[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] =
    useState<RegistroConsumo | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");
  const [selectedFecha, setSelectedFecha] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mapas
  const asignacionesMap = useMemo(
    () => new Map(asignaciones.map((a) => [a.id, a])),
    [asignaciones]
  );

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regs, asigs, rutasData, choferesData, vehiculosData] =
        await Promise.all([
          registroConsumoService.getRegistrosConsumo(),
          asignacionesService.getAsignaciones(),
          rutasService.getAllRutas(),
          choferesService.getChoferes(),
          vehiclesService.getVehicles(),
        ]);

      // Enriquecer asignaciones con detalles completos
      const asignacionesCompletas = (Array.isArray(asigs) ? asigs : []).map(
        (a: any) => ({
          ...a,
          ruta: rutasData.find((r: any) => r.id === a.rutaId),
          chofer: choferesData.find((c: any) => c.id === a.choferId),
          vehiculo: vehiculosData.find((v: any) => v.id === a.vehiculoId),
        })
      );

      setRegistros(Array.isArray(regs) ? regs : []);
      setAsignaciones(asignacionesCompletas);
    } catch (err) {
      console.error("Error al cargar registros de consumo:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return registros.filter((r) => {
      const asignacion = asignacionesMap.get(r.asignacionRutaId);
      const ruta = asignacion?.ruta?.nombre?.toLowerCase() || "";
      const chofer = asignacion
        ? getNombreCompleto(asignacion.chofer).toLowerCase()
        : "";
      const vehiculo = asignacion?.vehiculo?.nombre?.toLowerCase() || "";

      const matchesTerm =
        !term ||
        ruta.includes(term) ||
        chofer.includes(term) ||
        vehiculo.includes(term);
      const matchesEstado =
        selectedEstado === "todos" ||
        (selectedEstado === "activo" && r.estadoId === 1) ||
        (selectedEstado === "inactivo" && r.estadoId !== 1);
      const matchesFecha =
        selectedFecha === "" ||
        (r.fechaRegistro &&
          new Date(r.fechaRegistro).toISOString().split("T")[0] ===
            selectedFecha);

      return matchesTerm && matchesEstado && matchesFecha;
    });
  }, [registros, asignacionesMap, searchTerm, selectedEstado, selectedFecha]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedEstado("todos");
    setSelectedFecha("");
    setCurrentPage(1);
  };

  const handleEdit = (r: RegistroConsumo) => {
    setEditingRegistro(r);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingRegistro(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRegistro(null);
  };

  const getDiferenciaColor = (estimado: number, real: number) => {
    const diff = real - estimado;
    if (diff === 0) return "text-green-400";
    return diff > 0 ? "text-red-400" : "text-blue-400";
  };

  const getDiferenciaIcon = (estimado: number, real: number) => {
    const diff = real - estimado;
    if (diff === 0) return <CheckCircle className="w-4 h-4" />;
    return diff > 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado con botón a la derecha */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <Fuel className="text-blue-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-400">
              Registro de Consumo
            </h1>
            <p className="text-slate-400">
              Gestión del consumo de combustible por asignación de rutas.
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
          title="Registrar nuevo consumo"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Registro</span>
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
            onChange={(e) =>
              setSelectedEstado(
                e.target.value as "todos" | "activo" | "inactivo"
              )
            }
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 transition-all"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Pendientes</option>
            <option value="inactivo">Completados/Cancelados</option>
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
          Lista de Registros de Consumo
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-slate-400">Cargando registros...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <Fuel className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {registros.length === 0
                ? "No hay registros de consumo"
                : "No se encontraron resultados con los filtros aplicados"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3">Asignación</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Estimado</th>
                    <th className="px-6 py-3">Real</th>
                    <th className="px-6 py-3">Diferencia</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) => {
                    const asignacion = asignacionesMap.get(r.asignacionRutaId);
                    const diferencia =
                      r.combustibleReal - r.combustibleEstimado;
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-4 text-slate-200">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {asignacion?.ruta?.nombre || "N/A"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {asignacion?.chofer
                                ? getNombreCompleto(asignacion.chofer)
                                : "N/A"}{" "}
                              • {asignacion?.vehiculo?.nombre || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {new Date(r.fechaRegistro).toLocaleDateString(
                            "es-ES"
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {r.combustibleEstimado.toFixed(2)} L
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {r.combustibleReal.toFixed(2)} L
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`flex items-center gap-1 ${getDiferenciaColor(
                              r.combustibleEstimado,
                              r.combustibleReal
                            )}`}
                          >
                            {getDiferenciaIcon(
                              r.combustibleEstimado,
                              r.combustibleReal
                            )}
                            <span className="font-medium">
                              {diferencia > 0 ? "+" : ""}
                              {diferencia.toFixed(2)} L
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.estadoId === 1
                                ? "bg-yellow-500/20 text-yellow-400"
                                : r.estadoId === 2
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {estadoMap[r.estadoId] || "Desconocido"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                              title="Editar"
                            >
                              <Calculator className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  a {Math.min(currentPage * itemsPerPage, filtered.length)} de{" "}
                  {filtered.length} registros
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
      <RegistroConsumoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        editingRegistro={editingRegistro}
        asignaciones={asignaciones}
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
