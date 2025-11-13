import { useEffect, useState, useMemo } from "react";
import {
  Route,
  Edit,
  Plus,
  Power,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import RutaModal from "../components/RutaModal";
import TextField from "../components/TextField";
import Button from "../components/Button";

import { rutasService } from "../services/rutas.service";
import { puntosService } from "../services/puntos.service";
import type { Ruta, Punto } from "../types/rutas";

export default function Rutas() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [loadingRutas, setLoadingRutas] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<Ruta | null>(null);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // map de puntos
  const puntosMap = useMemo(() => {
    const map = new Map<number, Punto>();
    puntos.forEach((p) => map.set(p.id, p));
    return map;
  }, [puntos]);

  // Filtro y búsqueda
  const filteredRutas = useMemo(() => {
    const term = (searchTerm ?? "").toLowerCase().trim();
    return rutas.filter((ruta) => {
      const nombre = String(ruta.nombre ?? "").toLowerCase();
      const puntoInicio =
        puntosMap.get(ruta.puntoInicioId)?.nombre.toLowerCase() || "";
      const puntoFin =
        puntosMap.get(ruta.puntoFinId)?.nombre.toLowerCase() || "";

      const matchesSearch =
        term === "" ||
        nombre.includes(term) ||
        puntoInicio.includes(term) ||
        puntoFin.includes(term);

      const matchesEstado =
        selectedEstado === "todos" ||
        (selectedEstado === "activo" && ruta.estado) ||
        (selectedEstado === "inactivo" && !ruta.estado);

      return matchesSearch && matchesEstado;
    });
  }, [rutas, searchTerm, selectedEstado, puntosMap]);

  // Paginación
  const totalPages = Math.ceil(filteredRutas.length / itemsPerPage);
  const paginatedRutas = filteredRutas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedEstado("todos");
    setCurrentPage(1);
  };

  // Cargar Puntos
  useEffect(() => {
    (async () => {
      try {
        const data = await puntosService.getPuntos();
        setPuntos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("No se pudieron cargar los puntos");
      }
    })();
  }, []);

  // Cargar Rutas
  useEffect(() => {
    loadRutas();
  }, []);

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEstado]);

  // Cargar filtros desde sessionStorage
  useEffect(() => {
    const savedFilters = sessionStorage.getItem("rutasFilters");
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSearchTerm(filters.searchTerm || "");
        setSelectedEstado(filters.selectedEstado || "todos");
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
      currentPage,
    };
    sessionStorage.setItem("rutasFilters", JSON.stringify(filters));
  }, [searchTerm, selectedEstado, currentPage]);

  const loadRutas = async () => {
    try {
      setLoadingRutas(true);
      const data = await rutasService.getAllRutas();
      setRutas(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("No se pudieron cargar las rutas");
    } finally {
      setLoadingRutas(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRuta(null);
  };

  const handleEdit = (ruta: Ruta) => {
    setEditingRuta(ruta);
    openModal();
  };

  const handleToggleEstado = async (ruta: Ruta) => {
    try {
      await rutasService.updateRutaEstado(ruta.id, !ruta.estado);
      loadRutas();
    } catch (e: any) {
      console.error("Error al cambiar estado de la ruta:", e);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado + Acciones */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <Route className="text-blue-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-400">
              Registro de Rutas
            </h1>
            <p className="text-slate-400">
              Crea una nueva ruta manteniendo el inventario de rutas del
              sistema.
            </p>
          </div>
        </div>

        {/* Botón NUEVA RUTA */}
        <button
          onClick={openModal}
          className="
            inline-flex w-auto items-center gap-2
            rounded-lg px-4 h-10
            bg-gradient-to-r from-blue-500 to-cyan-500
            text-white font-semibold
            shadow-lg shadow-blue-500/20
            hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50
            transition
          "
          title="Agregar nueva ruta"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Ruta</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <TextField
              placeholder="Buscar por nombre o puntos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-700 focus:border-blue-500 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <select
          value={selectedEstado}
          onChange={(e) =>
            setSelectedEstado(e.target.value as "todos" | "activo" | "inactivo")
          }
          className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
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
        {/* Tabla de Rutas */}
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-blue-500/5">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">
            Lista de Rutas
          </h2>
          {loadingRutas ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-400">Cargando rutas...</p>
            </div>
          ) : filteredRutas.length === 0 ? (
            <div className="text-center py-8">
              <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {rutas.length === 0
                  ? "No hay rutas registradas"
                  : "No se encontraron rutas que coincidan con los filtros aplicados"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Punto Inicio</th>
                      <th className="px-6 py-3">Punto Fin</th>
                      <th className="px-6 py-3">Distancia (km)</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRutas.map((ruta) => (
                      <tr
                        key={ruta.id}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-4 text-slate-200 font-mono">
                          {ruta.id}
                        </td>
                        <td className="px-6 py-4 text-slate-200">
                          {ruta.nombre}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {puntosMap.get(ruta.puntoInicioId)?.nombre || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {puntosMap.get(ruta.puntoFinId)?.nombre || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {ruta.distancia} km
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleEstado(ruta)}
                            className={`flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium transition-colors ${
                              ruta.estado
                                ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                            }`}
                            title={
                              ruta.estado ? "Desactivar ruta" : "Activar ruta"
                            }
                          >
                            <Power
                              className={`w-3 h-3 ${
                                ruta.estado ? "text-blue-400" : "text-gray-400"
                              }`}
                            />
                            {ruta.estado ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(ruta)}
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
                      filteredRutas.length
                    )}{" "}
                    a{" "}
                    {Math.min(currentPage * itemsPerPage, filteredRutas.length)}{" "}
                    de {filteredRutas.length} rutas
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

        {/* Modal del Formulario */}
        <RutaModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingRuta={editingRuta}
          onSuccess={() => {
            loadRutas();
            closeModal();
          }}
        />
      </div>

      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>
    </div>
  );
}
