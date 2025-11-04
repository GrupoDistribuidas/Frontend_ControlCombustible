import { useEffect, useState, useMemo } from "react";
import {
  MapPin,
  Edit,
  Plus,
  Power,
  CheckCircle,
  XCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import TextField from "../components/TextField";
import Button from "../components/Button";

import { puntosService } from "../services/puntos.service";
import type { Punto } from "../types/rutas";
import PuntoModal from "../components/PuntoModal";

export default function Puntos() {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [loadingPuntos, setLoadingPuntos] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPunto, setEditingPunto] = useState<Punto | null>(null);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtro y búsqueda
  const filteredPuntos = useMemo(() => {
    const term = (searchTerm ?? "").toLowerCase().trim();
    return puntos.filter((punto) => {
      const nombre = String(punto.nombre ?? "").toLowerCase();
      const direccion = String(punto.direccion ?? "").toLowerCase();
      const provincia = String(punto.provincia ?? "").toLowerCase();
      const tipoPunto = String(punto.tipoPunto ?? "").toLowerCase();

      const matchesSearch =
        term === "" ||
        nombre.includes(term) ||
        direccion.includes(term) ||
        provincia.includes(term) ||
        tipoPunto.includes(term);

      // Asumiendo que Punto tiene estado, si no, ajustar
      const matchesEstado = true; // Placeholder, ajustar si Punto tiene estado

      return matchesSearch && matchesEstado;
    });
  }, [puntos, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredPuntos.length / itemsPerPage);
  const paginatedPuntos = filteredPuntos.slice(
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
    loadPuntos();
  }, []);

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEstado]);

  // Cargar filtros desde sessionStorage
  useEffect(() => {
    const savedFilters = sessionStorage.getItem("puntosFilters");
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
    sessionStorage.setItem("puntosFilters", JSON.stringify(filters));
  }, [searchTerm, selectedEstado, currentPage]);

  const loadPuntos = async () => {
    try {
      setLoadingPuntos(true);
      const data = await puntosService.getPuntos();
      setPuntos(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("No se pudieron cargar los puntos");
    } finally {
      setLoadingPuntos(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPunto(null);
  };

  const handleEdit = (punto: Punto) => {
    setEditingPunto(punto);
    openModal();
  };

  // Placeholder para toggle estado, ajustar si Punto tiene estado
  const handleToggleEstado = async (punto: Punto) => {
    // Implementar si es necesario
    console.log("Toggle estado para punto:", punto);
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado + Acciones */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
            <MapPin className="text-blue-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-400">
              Registro de Puntos
            </h1>
            <p className="text-slate-400">
              Crea un nuevo punto manteniendo el inventario de puntos del
              sistema.
            </p>
          </div>
        </div>

        {/* Botón NUEVO PUNTO */}
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
          title="Agregar nuevo punto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Punto</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <TextField
              placeholder="Buscar por nombre, dirección, provincia o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-700 focus:border-blue-500 pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
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
        {/* Tabla de Puntos */}
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-blue-500/5">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">
            Lista de Puntos
          </h2>
          {loadingPuntos ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-400">Cargando puntos...</p>
            </div>
          ) : filteredPuntos.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {puntos.length === 0
                  ? "No hay puntos registrados"
                  : "No se encontraron puntos que coincidan con los filtros aplicados"}
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
                      <th className="px-6 py-3">Dirección</th>
                      <th className="px-6 py-3">Provincia</th>
                      <th className="px-6 py-3">Tipo de Punto</th>
                      <th className="px-6 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPuntos.map((punto) => (
                      <tr
                        key={punto.id}
                        className="border-b border-slate-700/50 hover:bg-slate-800/30"
                      >
                        <td className="px-6 py-4 text-slate-200 font-mono">
                          {punto.id}
                        </td>
                        <td className="px-6 py-4 text-slate-200">
                          {punto.nombre}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {punto.direccion}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {punto.provincia}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {punto.tipoPunto}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(punto)}
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
                      filteredPuntos.length
                    )}{" "}
                    a{" "}
                    {Math.min(currentPage * itemsPerPage, filteredPuntos.length)}{" "}
                    de {filteredPuntos.length} puntos
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
        <PuntoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingPunto={editingPunto}
          onSuccess={() => {
            loadPuntos();
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
