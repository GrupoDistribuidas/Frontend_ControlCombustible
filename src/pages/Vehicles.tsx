import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VehicleCreateSchema,
  type TipoMaquinaria,
  type VehicleCreateInput,
} from "../validation/vehicles";
import { vehiclesService } from "../services/vehicles.service";
import TextField from "../components/TextField";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { Fuel, Gauge, Truck, Search, Plus, Filter, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const MAX_TANQUE = 500;
const PLACA_RE = /^[A-Z]{3}-\d{4}$/; // AAA-1234

export default function Vehicles() {
  const { user } = useAuth();
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<number | "">("");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Verificar permisos
  const canViewVehicles = user?.role === "Administrador" || user?.role === "Supervisor";
  const canCreateVehicles = user?.role === "Administrador";
  const canExportVehicles = user?.role === "Administrador" || user?.role === "Supervisor";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<VehicleCreateInput>({
    resolver: zodResolver(VehicleCreateSchema),
    defaultValues: {
      nombre: "",
      placa: "",
      marca: "",
      modelo: "",
      tipoMaquinariaId: 0,
      disponible: "",
      consumoCombustibleKm: 0.1,
      capacidadCombustible: 1,
    },
    mode: "onTouched",
  });

  const handleReset = () => {
    reset();
    setOkMsg(null);
    setServerError(null);
  };

  // valores dinámicos
  const capacidad = Number(watch("capacidadCombustible") ?? 0);
  const consumo = Number(watch("consumoCombustibleKm") ?? 0);

  const porcentaje = useMemo(() => {
    const p = Math.max(0, Math.min(100, (capacidad / MAX_TANQUE) * 100));
    return Number.isFinite(p) ? p : 0;
  }, [capacidad]);

  // Crear mapa de tipos para mostrar nombres en la tabla
  const tiposMap = useMemo(() => {
    const map = new Map<number, string>();
    tipos.forEach(tipo => map.set(tipo.id, tipo.nombre));
    return map;
  }, [tipos]);

  // Filtrar vehículos
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = searchTerm === "" ||
        vehicle.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = selectedTipo === "" || vehicle.tipoMaquinariaId === selectedTipo;
      const matchesEstado = selectedEstado === "" || (vehicle.disponible || "").toLowerCase().trim() === selectedEstado.toLowerCase().trim();
      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [vehicles, searchTerm, selectedTipo, selectedEstado]);

  // Paginación
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Función para exportar datos
  const handleExport = async () => {
    if (!canExportVehicles || exportLoading) return;

    setExportLoading(true);
    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const csvContent = [
        ["Nombre", "Placa", "Marca", "Modelo", "Tipo", "Estado", "Consumo (L/Km)", "Capacidad (L)"],
        ...filteredVehicles.map(vehicle => [
          vehicle.nombre || '',
          vehicle.placa || '',
          vehicle.marca || '',
          vehicle.modelo || '',
          tiposMap.get(vehicle.tipoMaquinariaId) || '',
          vehicle.disponible || '',
          vehicle.consumoCombustibleKm || '',
          vehicle.capacidadCombustible || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vehiculos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setOkMsg("✅ Datos exportados correctamente.");
    } catch (error) {
      setServerError("❌ Error al exportar los datos.");
    } finally {
      setExportLoading(false);
    }
  };

  // cargar tipos
  useEffect(() => {
    (async () => {
      try {
        setLoadingTipos(true);
        const data = await vehiclesService.getTipos();
        setTipos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setServerError(e.message ?? "No se pudieron cargar los tipos de maquinaria");
      } finally {
        setLoadingTipos(false);
      }
    })();
  }, []);

  // cargar vehículos (para validar unicidad)
  useEffect(() => {
    if (!canViewVehicles) return;

    (async () => {
      try {
        setLoadingVehicles(true);
        const data = await vehiclesService.getVehicles();
        setVehicles(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setServerError(e.message ?? "No se pudieron cargar los vehículos");
      } finally {
        setLoadingVehicles(false);
      }
    })();
  }, [canViewVehicles]);

  useEffect(() => {
    if (!okMsg) return;
    const timeout = setTimeout(() => setOkMsg(null), 3500);
    return () => clearTimeout(timeout);
  }, [okMsg]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTipo, selectedEstado]);

  // envío
  const onSubmit = async (values: VehicleCreateInput) => {
    if (!canCreateVehicles) return;

    setServerError(null);
    setOkMsg(null);

    // Normaliza placa (por si llega en minúsculas)
    const placa = String(values.placa).toUpperCase().trim();
    const formatoOk = PLACA_RE.test(placa);
    const existe = vehicles.some(
      (v) => String(v.placa || "").toUpperCase().trim() === placa
    );

    if (!formatoOk) {
      setError("placa", {
        type: "validate",
        message: "La placa debe tener el formato AAA-1234 (tres letras y cuatro números)",
      });
      return;
    }
    if (existe) {
      setError("placa", {
        type: "validate",
        message: `La placa ${placa} ya está registrada.`,
      });
      return;
    }

    try {
      await vehiclesService.createVehicle({ ...values, placa } as any);
      setOkMsg("✅ Vehículo creado correctamente.");
      reset();
      // refrescar lista para que aparezca el nuevo registro
      const data = await vehiclesService.getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const errorMsg = e.message ?? "❌ No se pudo crear el vehículo";
      if (errorMsg.toLowerCase().includes("placa")) {
        setError("placa", {
          type: "server",
          message: "La placa ya está registrada. Por favor, use una placa diferente.",
        });
      } else {
        setServerError(errorMsg);
      }
    }
  };

  // bloqueo de negativos
  const blockMinusKey: React.KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key === "-" || ev.key === "e") ev.preventDefault();
  };
  const clampNonNegative: React.FormEventHandler<HTMLInputElement> = (ev) => {
    const el = ev.currentTarget;
    const num = Number(el.value);
    if (Number.isNaN(num) || num < 0) el.value = "0";
  };

  // Si no tiene permisos para ver vehículos
  if (!canViewVehicles) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-12">
        <div className="text-center py-12">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/30 mx-auto w-fit mb-4">
            <Fuel className="text-red-400 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-red-400 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-slate-400">
            No tienes permisos para acceder a la gestión de vehículos.
          </p>
          <p className="text-slate-500 mt-2">
            Contacta al administrador si crees que esto es un error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
          <Fuel className="text-emerald-400 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">
            Gestión de Vehículos
          </h1>
          <p className="text-slate-400">
            {canCreateVehicles
              ? "Registra un nuevo vehículo en el sistema de control de combustible."
              : "Visualiza los vehículos registrados en el sistema."
            }
          </p>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Formulario - Solo para Administradores */}
        {canCreateVehicles && (
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-emerald-500/5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Nombre */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Nombre del Vehículo
                  </label>
                  <TextField
                    placeholder="Ej. Camión de Carga"
                    {...register("nombre")}
                    className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-400">{errors.nombre.message}</p>
                  )}
                </div>

                {/* Placa */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">Placa</label>
                  <TextField
                    placeholder="Ej. ABC-1234"
                    {...register("placa", {
                      setValueAs: (v) => String(v ?? "").toUpperCase().replace(/\s+/g, ""),
                      validate: {
                        formato: (val) =>
                          PLACA_RE.test(val || "") ||
                          "La placa debe tener el formato AAA-1234 (tres letras y cuatro números)",
                        unica: (val) =>
                          !vehicles.some(
                            (v) => String(v.placa || "").toUpperCase().trim() === String(val || "").toUpperCase().trim()
                          ) || "La placa ya está registrada.",
                      },
                    })}
                    onChange={() => clearErrors("placa")}
                    className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">Formato requerido: AAA-1234.</p>
                  {errors.placa && (
                    <p className="mt-1 text-sm text-red-400">{errors.placa.message}</p>
                  )}
                </div>

                {/* Marca */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">Marca</label>
                  <TextField
                    placeholder="Ej. Volvo"
                    {...register("marca")}
                    className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                  />
                  {errors.marca && (
                    <p className="mt-1 text-sm text-red-400">{errors.marca.message}</p>
                  )}
                </div>

                {/* Modelo */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">Modelo</label>
                  <TextField
                    placeholder="Ej. FH16"
                    {...register("modelo")}
                    className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                  />
                  {errors.modelo && (
                    <p className="mt-1 text-sm text-red-400">{errors.modelo.message}</p>
                  )}
                </div>

                {/* Tipo de maquinaria */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Tipo de maquinaria
                  </label>
                  <select
                    disabled={loadingTipos}
                    className={`w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-0 text-slate-200 appearance-none ${
                      loadingTipos ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    {...register("tipoMaquinariaId", {
                      setValueAs: (v) => (v === "" ? undefined : Number(String(v).replace(",", "."))),
                      validate: (v) => Number(v) > 0 || "Selecciona un tipo de maquinaria",
                    })}
                  >
                    <option value={0} disabled>
                      {loadingTipos ? "Cargando tipos..." : "Seleccione una maquinaria"}
                    </option>
                    {tipos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.tipoMaquinariaId && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.tipoMaquinariaId.message}
                    </p>
                  )}
                </div>

                {/* Estado del vehículo */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Estado del vehículo
                  </label>
                  <select
                    className="w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 text-slate-200 appearance-none"
                    {...register("disponible", {
                      validate: (v) => (v ? true : "Seleccione una disponibilidad"),
                    })}
                  >
                    <option value="" disabled>
                      Seleccione una disponibilidad
                    </option>
                    <option value="Disponible">Disponible</option>
                    <option value="En Mantenimiento">En Mantenimiento</option>
                    <option value="No Disponible">No Disponible</option>
                  </select>
                  {errors.disponible && (
                    <p className="mt-1 text-sm text-red-400">{errors.disponible.message}</p>
                  )}
                </div>

                {/* Consumo */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Consumo de combustible (L/Km)
                  </label>
                  <TextField
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Ej. 0.35"
                    onKeyDown={blockMinusKey}
                    onInput={clampNonNegative}
                    {...register("consumoCombustibleKm", {
                      setValueAs: (v) =>
                        v === "" ? undefined : Number(String(v).replace(",", ".")),
                    })}
                    className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    No se permiten valores negativos.
                  </p>
                  {errors.consumoCombustibleKm && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.consumoCombustibleKm.message}
                    </p>
                  )}
                </div>

                {/* Capacidad */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Capacidad del tanque (L)
                  </label>
                  <TextField
                    type="number"
                    step="1"
                    min={0}
                    placeholder="Ej. 500"
                    onKeyDown={blockMinusKey}
                    onInput={clampNonNegative}
                    {...register("capacidadCombustible", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                    className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    No se permiten valores negativos.
                  </p>
                  {errors.capacidadCombustible && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.capacidadCombustible.message}
                    </p>
                  )}
                </div>
              </div>

              {/* mensajes */}
              {serverError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {serverError}
                </div>
              )}
              {okMsg && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {okMsg}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
                  onClick={handleReset}
                >
                  Limpiar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-lime-500 hover:brightness-110 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? "Guardando..." : "Registrar vehículo"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Indicador lateral - Solo si hay formulario */}
        {canCreateVehicles && (
          <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:sticky md:top-8 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="text-emerald-400 w-5 h-5" />
              <h3 className="font-semibold">Indicador de tanque</h3>
            </div>
            {/* SVG tanque */}
            <div className="relative mx-auto mb-4 w-56">
              <svg viewBox="0 0 160 140" className="w-full">
                <rect
                  x="20"
                  y="10"
                  width="120"
                  height="120"
                  rx="16"
                  fill="#0f172a"
                  stroke="rgba(16,185,129,.5)"
                  strokeWidth="2"
                />
                <rect
                  x="65"
                  y="0"
                  width="30"
                  height="16"
                  rx="6"
                  fill="#0f172a"
                  stroke="rgba(16,185,129,.5)"
                  strokeWidth="2"
                />
                <clipPath id="tank-clip">
                  <rect x="20" y="10" width="120" height="120" rx="16" />
                </clipPath>
                <g clipPath="url(#tank-clip)">
                  <rect
                    x="20"
                    y={10 + (120 - (120 * porcentaje) / 100)}
                    width="120"
                    height={(120 * porcentaje) / 100}
                    fill="url(#grad)"
                  />
                </g>
                <defs>
                  <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="pointer-events-none absolute inset-0 rounded-2xl blur-2xl opacity-30 bg-gradient-to-b from-emerald-400/30 to-lime-400/20" />
            </div>

            {/* KPIs */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Capacidad</span>
                <span className="font-semibold text-slate-200">
                  {isFinite(capacidad) ? capacidad : 0} L
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">% de llenado</span>
                <span className="font-semibold text-emerald-400">
                  {porcentaje.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Consumo</span>
                <span className="font-semibold text-slate-200">
                  {isFinite(consumo) ? consumo : 0} L/Km
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Truck className="w-4 h-4" />
              <span>
                Máx. visual: {MAX_TANQUE} L — ajusta en código si tu flota usa otros tanques.
              </span>
            </div>
          </aside>
        )}
      </div>

      {/* Sección de visualización de vehículos */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
              <Truck className="text-blue-400 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-blue-400">
                Vehículos Registrados
              </h2>
              <p className="text-slate-400">
                Lista completa de vehículos en el sistema de control de combustible.
              </p>
            </div>
          </div>

          {/* Botón de exportar - Solo para Administrador y Supervisor */}
          {canExportVehicles && (
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Exportar</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <TextField
              placeholder="Buscar por nombre, placa, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/60 border border-slate-700 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
            ))}
          </select>
          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            <option value="No Disponible">No Disponible</option>
          </select>
        </div>

        {loadingVehicles ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No hay vehículos registrados aún.</p>
            <p className="text-slate-500">Registra tu primer vehículo usando el formulario arriba.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-transparent overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Placa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Marca</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Modelo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Consumo (L/Km)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Capacidad (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginatedVehicles.map((vehicle: any, index: number) => (
                    <tr key={vehicle.id || index} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-200 font-medium">{vehicle.nombre || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{vehicle.placa || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{vehicle.marca || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{vehicle.modelo || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{tiposMap.get(vehicle.tipoMaquinariaId) || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.disponible === 'Disponible'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : vehicle.disponible === 'En Mantenimiento'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {vehicle.disponible || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">{vehicle.consumoCombustibleKm || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{vehicle.capacidadCombustible || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVehicles.length)} a {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} de {filteredVehicles.length} vehículos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-200">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>
    </div>
  );
}
