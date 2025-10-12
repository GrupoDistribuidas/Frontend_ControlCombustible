import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { hasRole, ROLES } from "../services/roles.service";
import { vehiclesService } from "../services/vehicles.service";
import type { Vehicle } from "../services/vehicles.service";
import VisibleIf from "../components/VisibleIf";
import Button from "../components/Button";
import TextField from "../components/TextField";

export default function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    marca: "",
    modelo: "",
    disponible: "",
  });

  const canViewVehicles = hasRole(user, "ADMINISTRADOR") || hasRole(user, "SUPERVISOR");

  useEffect(() => {
    if (canViewVehicles) {
      loadVehicles();
    } else {
      setLoading(false);
    }
  }, [canViewVehicles]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesService.getAll();
      console.log("Vehicles data:", data);
      setVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadVehicles();
      return;
    }
    try {
      setLoading(true);
      const data = await vehiclesService.searchByTerm(searchTerm);
      setVehicles(data);
    } catch (error) {
      console.error("Error searching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value.trim() !== "")
      );
      const data = await vehiclesService.search(activeFilters);
      setVehicles(data);
    } catch (error) {
      console.error("Error filtering vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  const exportToCSV = () => {
    if (vehicles.length === 0) return;

    const headers = ["ID", "Nombre", "Placa", "Marca", "Modelo", "Disponible", "Consumo (L/Km)", "Capacidad (L)"];
    const csvContent = [
      headers.join(","),
      ...vehicles.map(vehicle => [
        vehicle.id,
        `"${vehicle.nombre}"`,
        `"${vehicle.placa}"`,
        `"${vehicle.marca}"`,
        `"${vehicle.modelo}"`,
        `"${vehicle.disponible}"`,
        vehicle.consumoCombustibleKm,
        vehicle.capacidadCombustible
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "vehiculos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canViewVehicles) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
        <h1 className="text-xl font-semibold text-red-400">Acceso Denegado</h1>
        <p className="mt-2 text-red-300">
          No tienes permisos suficientes para acceder a esta sección.
          Solo usuarios con rol Administrador o Supervisor pueden visualizar los datos de vehículos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-semibold">Gestión de Vehículos</h1>
        <p className="mt-2 text-slate-300">
          Visualiza y administra la información de los vehículos registrados en el sistema.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-medium mb-4">Buscar y Filtrar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Buscar por término</label>
            <TextField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Nombre, placa, marca..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Marca</label>
            <TextField
              value={filters.marca}
              onChange={(e) => setFilters(prev => ({ ...prev, marca: e.target.value }))}
              onKeyPress={handleFilterKeyPress}
              placeholder="Ej: Volvo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Modelo</label>
            <TextField
              value={filters.modelo}
              onChange={(e) => setFilters(prev => ({ ...prev, modelo: e.target.value }))}
              onKeyPress={handleFilterKeyPress}
              placeholder="Ej: FH16"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Disponibilidad</label>
            <select
              value={filters.disponible}
              onChange={(e) => setFilters(prev => ({ ...prev, disponible: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="Disponible">Disponible</option>
              <option value="En mantenimiento">En mantenimiento</option>
              <option value="No Disponible">No Disponible</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleSearch} disabled={loading}>
            Buscar
          </Button>
          <Button onClick={handleFilter} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            Aplicar Filtros
          </Button>
          <Button onClick={loadVehicles} disabled={loading} className="bg-gray-600 hover:bg-gray-700">
            Limpiar
          </Button>
        </div>
      </div>

      {/* Export Button */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-medium">Lista de Vehículos</h2>
          <Button onClick={exportToCSV} disabled={vehicles.length === 0} className="bg-green-600 hover:bg-green-700">
            Exportar a CSV
          </Button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-slate-400">Cargando vehículos...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No se encontraron vehículos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-300">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Nombre</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Placa</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Marca</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Disponible</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Consumo (L/Km)</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Capacidad (L)</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => (
                  <tr key={vehicle.id || index} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-slate-100">{vehicle.id}</td>
                    <td className="py-3 px-4 text-slate-100">{vehicle.nombre}</td>
                    <td className="py-3 px-4 text-slate-100 font-mono">{vehicle.placa}</td>
                    <td className="py-3 px-4 text-slate-100">{vehicle.marca}</td>
                    <td className="py-3 px-4 text-slate-100">{vehicle.modelo}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.disponible === "Disponible"
                          ? "bg-green-500/20 text-green-400"
                          : vehicle.disponible === "En mantenimiento"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {vehicle.disponible}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-100">{vehicle.consumoCombustibleKm}</td>
                    <td className="py-3 px-4 text-slate-100">{vehicle.capacidadCombustible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vehicles.length > 10 && (
              <div className="mt-4 text-center text-slate-400 text-sm">
                Mostrando {vehicles.length} vehículos
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
