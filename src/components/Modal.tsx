import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Fuel, Gauge, Truck, X } from "lucide-react";
import { VehicleCreateSchema, type TipoMaquinaria, type VehicleCreateInput } from "../validation/vehicles";
import { vehiclesService } from "../services/vehicles.service";
import TextField from "./TextField";
import Button from "./Button";

const MAX_TANQUE = 500;
const PLACA_RE = /^[A-Z]{3}-\d{4}$/; // AAA-1234

// 🔧 Normaliza el estado del backend a las 3 opciones del combo
function normalizeEstado(
  raw: any
): "Disponible" | "En Mantenimiento" | "No Disponible" {
  const n = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (n === "disponible") return "Disponible";
  if (n === "enmantenimiento" || n === "en mantenimiento")
    return "En Mantenimiento";
  if (n === "nodisponible" || n === "no disponible")
    return "No Disponible";

  // fallback seguro
  return "No Disponible";
}

export interface VehicleModalProps {
  open: boolean;
  onClose: () => void;
  vehicles: any[];
  tipos: TipoMaquinaria[];
  onCreated?: () => Promise<void> | void;
  editingVehicle?: any;
  onEdited?: () => Promise<void> | void;
}

export default function VehicleModal({
  open,
  onClose,
  vehicles,
  tipos,
  onCreated,
  editingVehicle,
  onEdited,
}: VehicleModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const isEditing = !!editingVehicle;

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
      disponible: "Disponible",
      consumoCombustibleKm: 0.1,
      capacidadCombustible: 1,
    },
    mode: "onTouched",
  });

  // 📥 Cargar datos para edición (con normalización)
  useEffect(() => {
    if (!open) return; // evita reset si el modal está cerrado

    if (isEditing && editingVehicle) {
      reset({
        nombre: editingVehicle.nombre ?? "",
        placa: editingVehicle.placa ?? "",
        marca: editingVehicle.marca ?? "",
        modelo: editingVehicle.modelo ?? "",
        // Asegura number para el select
        tipoMaquinariaId: Number(editingVehicle.tipoMaquinariaId) || 0,
        // Normaliza para que coincida con el combo
        disponible: normalizeEstado(editingVehicle.disponible),
        consumoCombustibleKm: editingVehicle.consumoCombustibleKm ?? 0.1,
        capacidadCombustible: editingVehicle.capacidadCombustible ?? 1,
      });
    } else {
      // modo crear
      reset({
        nombre: "",
        placa: "",
        marca: "",
        modelo: "",
        tipoMaquinariaId: 0,
        disponible: "Disponible",
        consumoCombustibleKm: 0.1,
        capacidadCombustible: 1,
      });
    }
  }, [open, isEditing, editingVehicle, reset]);

  // valores dinámicos
  const capacidad = Number(watch("capacidadCombustible") ?? 0);
  const consumo = Number(watch("consumoCombustibleKm") ?? 0);

  const porcentaje = useMemo(() => {
    const p = Math.max(0, Math.min(100, (capacidad / MAX_TANQUE) * 100));
    return Number.isFinite(p) ? p : 0;
  }, [capacidad]);

  const handleReset = () => {
    reset();
    setOkMsg(null);
    setServerError(null);
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

  useEffect(() => {
    if (!okMsg) return;
    const t = setTimeout(() => setOkMsg(null), 3500);
    return () => clearTimeout(t);
  }, [okMsg]);

  // ESC para cerrar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // 📨 envío
  const onSubmit = async (values: VehicleCreateInput) => {
    setServerError(null);
    setOkMsg(null);

    const placa = String(values.placa).toUpperCase().trim();
    const formatoOk = PLACA_RE.test(placa);

    // Evita duplicar placa (si edito, ignoro mi propio id)
    const existe = vehicles.some(
      (v) =>
        String(v.placa || "").toUpperCase().trim() === placa &&
        (!isEditing || v.id !== editingVehicle.id)
    );

    if (!formatoOk) {
      setError("placa", {
        type: "validate",
        message:
          "La placa debe tener el formato AAA-1234 (tres letras y cuatro números)",
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
      if (isEditing) {
        await vehiclesService.updateVehicle(editingVehicle.id, {
          ...values,
          placa,
        } as any);
        setOkMsg("Vehículo editado correctamente.");
        await onEdited?.();
      } else {
        await vehiclesService.createVehicle({ ...values, placa } as any);
        setOkMsg("Vehículo creado correctamente.");
        await onCreated?.();
      }
      reset();
      // onClose(); // si quieres cerrar automáticamente
    } catch (e: any) {
      const errorMsg =
        e.message ?? `❌ No se pudo ${isEditing ? "editar" : "crear"} el vehículo`;
      if (errorMsg.toLowerCase().includes("placa")) {
        setError("placa", {
          type: "server",
          message:
            "La placa ya está registrada. Por favor, use una placa diferente.",
        });
      } else {
        setServerError(errorMsg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-emerald-500/10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                <Fuel className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                  {isEditing ? "Editar Vehículo" : "Registrar Vehículo"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isEditing
                    ? "Modifica los datos del vehículo."
                    : "Completa los datos del vehículo para agregarlo al sistema."}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-slate-400"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Formulario */}
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-transparent p-6">
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
                        <p className="mt-1 text-sm text-red-400">
                          {errors.nombre.message}
                        </p>
                      )}
                    </div>

                    {/* Placa */}
                    <div>
                      <label className="mb-1 block text-sm text-slate-300 font-medium">
                        Placa
                      </label>
                      <TextField
                        placeholder="Ej. ABC-1234"
                        disabled={isEditing}
                        {...register("placa", {
                          setValueAs: (v) =>
                            String(v ?? "")
                              .toUpperCase()
                              .replace(/\s+/g, ""),
                          validate: {
                            formato: (val) =>
                              PLACA_RE.test(val || "") ||
                              "La placa debe tener el formato AAA-1234 (tres letras y cuatro números)",
                            unica: (val) =>
                              // si estoy editando, permitir mi propia placa
                              !vehicles.some(
                                (v) =>
                                  String(v.placa || "")
                                    .toUpperCase()
                                    .trim() ===
                                    String(val || "").toUpperCase().trim() &&
                                  (!isEditing || v.id !== editingVehicle?.id)
                              ) || "La placa ya está registrada.",
                          },
                        })}
                        onChange={() => clearErrors("placa")}
                        className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        Formato requerido: AAA-1234.
                      </p>
                      {errors.placa && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.placa.message}
                        </p>
                      )}
                    </div>

                    {/* Marca */}
                    <div>
                      <label className="mb-1 block text-sm text-slate-300 font-medium">
                        Marca
                      </label>
                      <TextField
                        placeholder="Ej. Volvo"
                        {...register("marca")}
                        className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                      />
                      {errors.marca && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.marca.message}
                        </p>
                      )}
                    </div>

                    {/* Modelo */}
                    <div>
                      <label className="mb-1 block text-sm text-slate-300 font-medium">
                        Modelo
                      </label>
                      <TextField
                        placeholder="Ej. FH16"
                        {...register("modelo")}
                        className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                      />
                      {errors.modelo && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.modelo.message}
                        </p>
                      )}
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="mb-1 block text-sm text-slate-300 font-medium">
                        Tipo de maquinaria
                      </label>
                      <select
                        className="w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-0 text-slate-200 appearance-none"
                        {...register("tipoMaquinariaId", {
                          setValueAs: (v) =>
                            v === "" ? 0 : Number(String(v).replace(",", ".")),
                          validate: (v) =>
                            Number(v) > 0 || "Selecciona un tipo de maquinaria",
                        })}
                      >
                        <option value={0} disabled>
                          {tipos?.length
                            ? "Seleccione una maquinaria"
                            : "No hay tipos disponibles"}
                        </option>
                        {tipos?.map((t) => (
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

                    {/* Estado */}
                    <div>
                      <label className="mb-1 block text-sm text-slate-300 font-medium">
                        Estado del vehículo
                      </label>
                      <select
                        className="w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 text-slate-200 appearance-none"
                        {...register("disponible", {
                          validate: (v) =>
                            v ? true : "Seleccione una disponibilidad",
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
                      {isSubmitting
                        ? "Guardando..."
                        : isEditing
                        ? "Editar vehículo"
                        : "Registrar vehículo"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Indicador lateral */}
              <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 h-fit">
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
          </div>
        </div>
      </div>
    </div>
  );
}
