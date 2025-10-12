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
import { Fuel, Gauge, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const MAX_TANQUE = 500;

export default function Vehicles() {
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const handleReset = () => {
    reset();                 // limpia el formulario
    setOkMsg(null);          // oculta “Vehículo creado correctamente.”
    setServerError(null);    // por si quedó algún error
  };
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleCreateInput>({
    resolver: zodResolver(VehicleCreateSchema),
    defaultValues: {
      nombre: "",
      placa: "",
      marca: "",
      modelo: "",
      tipoMaquinariaId: 0,
      disponible: "", // ✅ placeholder inicial
      consumoCombustibleKm: 0.1,
      capacidadCombustible: 1,
    },
    mode: "onTouched",
  });

  // 🔎 valores dinámicos
  const capacidad = Number(watch("capacidadCombustible") ?? 0);
  const consumo = Number(watch("consumoCombustibleKm") ?? 0);

  const porcentaje = useMemo(() => {
    const p = Math.max(0, Math.min(100, (capacidad / MAX_TANQUE) * 100));
    return Number.isFinite(p) ? p : 0;
  }, [capacidad]);

  // carga de tipos de maquinaria
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
  useEffect(() => {
    if (!okMsg) return;
    const timeout = setTimeout(() => setOkMsg(null), 3500); // 3.5s
    return () => clearTimeout(timeout);
  }, [okMsg]);

  // 🧾 envío
  const onSubmit = async (values: VehicleCreateInput) => {
    setServerError(null);
    setOkMsg(null);
    try {
      await vehiclesService.createVehicle(values as any); // Zod transforma el schema
      setOkMsg("✅ Vehículo creado correctamente.");
      reset();
    } catch (e: any) {
      setServerError(e.message ?? "❌ No se pudo crear el vehículo");
    }
  };

  // 🔒 bloqueo de negativos
  const blockMinusKey: React.KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (ev.key === "-" || ev.key === "e") ev.preventDefault();
  };
  const clampNonNegative: React.FormEventHandler<HTMLInputElement> = (ev) => {
    const el = ev.currentTarget;
    const num = Number(el.value);
    if (Number.isNaN(num) || num < 0) el.value = "0";
  };

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
            Registra un nuevo vehículo en el sistema de control de combustible.
          </p>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Formulario */}
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
                  {...register("placa")}
                  className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                />
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
                  className={`w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-0 text-slate-200 appearance-none ${loadingTipos ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  {...register("tipoMaquinariaId", {
                    setValueAs: (v) => v === "" ? undefined : Number(String(v).replace(",", ".")),
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
                  {...register("disponible")}
                >
                  <option value="" disabled>
                    Seleccione una disponibilidad
                  </option>
                  <option value="Disponible">Disponible</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                  <option value="No Disponible">No Disponible</option>
                </select>
                {errors.disponible && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.disponible.message}
                  </p>
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
                    setValueAs: (v) => v === "" ? undefined : Number(String(v).replace(",", ".")),
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
                    setValueAs: (v) => v === "" ? undefined : Number(v),
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
                onClick={() => handleReset()}
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
        {/* Indicador lateral */}
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
      </div>
      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>
    </div>
  );
}
