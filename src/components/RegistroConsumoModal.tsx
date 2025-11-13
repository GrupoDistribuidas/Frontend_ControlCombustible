import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  Fuel,
  X,
  Calculator,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Route,
  User,
  Truck,
  Calendar,
} from "lucide-react";
import { registroConsumoService } from "../services/registro-consumo.service";
import TextField from "./TextField";
import Button from "./Button";
import type {
  RegistroConsumo,
  AsignacionConDetalles,
} from "../types/registro-consumo";

interface RegistroConsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRegistro?: RegistroConsumo | null;
  asignaciones: AsignacionConDetalles[];
  onSuccess?: () => void;
}

const getNombreCompleto = (chofer: any) =>
  `${chofer?.primerNombre || ""} ${chofer?.segundoNombre || ""} ${
    chofer?.primerApellido || ""
  } ${chofer?.segundoApellido || ""}`.trim();

export default function RegistroConsumoModal({
  isOpen,
  onClose,
  editingRegistro,
  asignaciones,
  onSuccess,
}: RegistroConsumoModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedAsignacion, setSelectedAsignacion] =
    useState<AsignacionConDetalles | null>(null);
  const [combustibleEstimado, setCombustibleEstimado] = useState<number>(0);

  const isEditing = !!editingRegistro;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      asignacionRutaId: 0,
      fechaRegistro: new Date().toISOString().split("T")[0],
      combustibleEstimado: 0,
      combustibleReal: 0,
      motivo: "",
      estadoId: 1,
    },
    mode: "onTouched",
  });

  const watchedAsignacionId = watch("asignacionRutaId");
  const watchedCombustibleReal = watch("combustibleReal");

  // Calcular consumo estimado cuando cambia la asignación
  useEffect(() => {
    if (watchedAsignacionId && watchedAsignacionId > 0) {
      const asignacion = asignaciones.find((a) => a.id === watchedAsignacionId);
      if (asignacion && asignacion.ruta && asignacion.vehiculo) {
        const estimado =
          asignacion.ruta.distancia * asignacion.vehiculo.consumoCombustibleKm;
        setCombustibleEstimado(estimado);
        setValue("combustibleEstimado", estimado);
        setSelectedAsignacion(asignacion);
      }
    } else {
      setCombustibleEstimado(0);
      setSelectedAsignacion(null);
    }
  }, [watchedAsignacionId, asignaciones, setValue]);

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingRegistro) {
      const asignacion = asignaciones.find(
        (a) => a.id === editingRegistro.asignacionRutaId
      );
      setSelectedAsignacion(asignacion || null);
      setCombustibleEstimado(editingRegistro.combustibleEstimado);

      reset({
        asignacionRutaId: editingRegistro.asignacionRutaId,
        fechaRegistro: new Date(editingRegistro.fechaRegistro)
          .toISOString()
          .split("T")[0],
        combustibleEstimado: editingRegistro.combustibleEstimado,
        combustibleReal: editingRegistro.combustibleReal,
        motivo: editingRegistro.motivo || "",
        estadoId: editingRegistro.estadoId,
      });
    } else {
      setSelectedAsignacion(null);
      setCombustibleEstimado(0);
      reset({
        asignacionRutaId: 0,
        fechaRegistro: new Date().toISOString().split("T")[0],
        combustibleEstimado: 0,
        combustibleReal: 0,
        motivo: "",
        estadoId: 1,
      });
    }
  }, [isOpen, isEditing, editingRegistro, asignaciones, reset]);

  const onSubmit = async (data: any) => {
    try {
      setServerError(null);

      const payload = {
        asignacionRutaId: data.asignacionRutaId,
        fechaRegistro: new Date(data.fechaRegistro).toISOString(),
        combustibleEstimado: data.combustibleEstimado,
        combustibleReal: data.combustibleReal,
        motivo: data.motivo || undefined,
        estadoId: data.estadoId,
      };

      if (isEditing && editingRegistro) {
        await registroConsumoService.updateRegistroConsumo(
          editingRegistro.id,
          payload
        );
        toast.success("Registro de consumo actualizado exitosamente");
      } else {
        await registroConsumoService.createRegistroConsumo(payload);
        toast.success("Registro de consumo creado exitosamente");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      let msg = error?.message || "Error al guardar el registro de consumo";

      // Handle specific backend validation errors
      if (msg.includes("InvalidArgument")) {
        msg = "❌ Datos inválidos. Verifique la información ingresada.";
      } else if (msg.includes("NotFound")) {
        msg =
          "❌ Asignación no encontrada. Verifique que la asignación existe.";
      } else if (msg.includes("FailedPrecondition")) {
        msg = "❌ Error de precondición. La asignación debe estar completada.";
      } else if (msg.includes("Error interno")) {
        msg = "❌ Error interno del servidor. Contacte al administrador.";
      }

      setServerError(msg);
      console.error("Error saving registro consumo:", error);
    }
  };

  const handleReset = () => {
    reset();
    setServerError(null);
    setSelectedAsignacion(null);
    setCombustibleEstimado(0);
  };

  // ESC para cerrar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const diferencia = watchedCombustibleReal - combustibleEstimado;
  const requiereMotivo = diferencia > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Efecto de fondo sutil */}
          <div className="absolute inset-0 bg-white/5 rounded-2xl blur-2xl" />
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur-lg opacity-50" />
                    <div className="relative p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/25">
                      <Fuel className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                      {isEditing
                        ? "✏️ Editar Registro de Consumo"
                        : "➕ Nuevo Registro de Consumo"}
                    </h2>
                    <p className="text-slate-400 mt-1">
                      {isEditing
                        ? "Modificar el registro existente"
                        : "Registrar consumo de combustible para una asignación"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-slate-800/60 rounded-xl transition-all duration-200 transform hover:scale-110 hover:shadow-lg hover:shadow-red-500/20 group"
                >
                  <X className="w-6 h-6 text-slate-400 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asignación */}
                <div className="relative md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                        <Route className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-slate-200">
                        📋 Asignación de Ruta
                      </span>
                    </div>
                  </label>
                  <select
                    {...register("asignacionRutaId", { valueAsNumber: true })}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-slate-100 placeholder-slate-400 transition-all duration-200"
                    disabled={isEditing}
                  >
                    <option value={0}>Seleccionar asignación...</option>
                    {asignaciones
                      .filter((a) => a.estadoId === 2) // Solo asignaciones en proceso
                      .map((asignacion) => (
                        <option key={asignacion.id} value={asignacion.id}>
                          {asignacion.ruta?.nombre || "Sin ruta"} -{" "}
                          {asignacion.vehiculo?.nombre || "Sin vehículo"} -{" "}
                          {asignacion.chofer
                            ? getNombreCompleto(asignacion.chofer)
                            : "Sin chofer"}{" "}
                          -{" "}
                          {new Date(
                            asignacion.fechaAsignacion
                          ).toLocaleDateString("es-ES")}
                        </option>
                      ))}
                  </select>
                  {errors.asignacionRutaId && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span>⚠️</span> {errors.asignacionRutaId.message}
                    </p>
                  )}
                </div>

                {/* Detalles de la asignación seleccionada */}
                {selectedAsignacion && (
                  <div className="md:col-span-2 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">
                      Detalles de la Asignación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Route className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300">
                          <strong>Ruta:</strong>{" "}
                          {selectedAsignacion.ruta?.nombre} (
                          {selectedAsignacion.ruta?.distancia} km)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-400" />
                        <span className="text-slate-300">
                          <strong>Chofer:</strong>{" "}
                          {selectedAsignacion.chofer
                            ? getNombreCompleto(selectedAsignacion.chofer)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-300">
                          <strong>Vehículo:</strong>{" "}
                          {selectedAsignacion.vehiculo?.nombre} (
                          {selectedAsignacion.vehiculo?.consumoCombustibleKm}{" "}
                          L/km)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fecha de Registro */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-slate-200">
                        📅 Fecha de Registro
                      </span>
                    </div>
                  </label>
                  <TextField
                    type="date"
                    {...register("fechaRegistro")}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-slate-100 transition-all duration-200"
                  />
                  {errors.fechaRegistro && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span>⚠️</span> {errors.fechaRegistro.message}
                    </p>
                  )}
                </div>

                {/* Consumo Estimado */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                        <Calculator className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-slate-200">
                        📊 Consumo Estimado
                      </span>
                    </div>
                  </label>
                  <div className="relative">
                    <TextField
                      type="number"
                      step="0.01"
                      {...register("combustibleEstimado", {
                        valueAsNumber: true,
                      })}
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-slate-100 transition-all duration-200 pr-12"
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                      L
                    </span>
                  </div>
                  {errors.combustibleEstimado && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span>⚠️</span> {errors.combustibleEstimado.message}
                    </p>
                  )}
                </div>

                {/* Consumo Real */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                        <Fuel className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-slate-200">⛽ Consumo Real</span>
                    </div>
                  </label>
                  <div className="relative">
                    <TextField
                      type="number"
                      step="0.01"
                      {...register("combustibleReal", { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-slate-100 transition-all duration-200 pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                      L
                    </span>
                  </div>
                  {errors.combustibleReal && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <span>⚠️</span> {errors.combustibleReal.message}
                    </p>
                  )}
                </div>

                {/* Diferencia */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                        {diferencia === 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : diferencia > 0 ? (
                          <TrendingUp className="w-5 h-5 text-red-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <span className="text-slate-200">📈 Diferencia</span>
                    </div>
                  </label>
                  <div
                    className={`w-full px-4 py-3 bg-slate-800/60 border rounded-xl text-slate-100 pr-12 ${
                      diferencia === 0
                        ? "border-green-500/50 bg-green-500/10"
                        : diferencia > 0
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-blue-500/50 bg-blue-500/10"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        diferencia === 0
                          ? "text-green-400"
                          : diferencia > 0
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    >
                      {diferencia > 0 ? "+" : ""}
                      {diferencia.toFixed(2)} L
                    </span>
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                      L
                    </span>
                  </div>
                </div>

                {/* Motivo (solo si consumo real > estimado) */}
                {requiereMotivo && (
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-slate-200">
                          ⚠️ Motivo (Obligatorio)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        El consumo real supera el estimado. Explique el motivo.
                      </p>
                    </label>
                    <textarea
                      {...register("motivo")}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-800/60 border border-red-500/50 rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 text-slate-100 placeholder-slate-400 transition-all duration-200 resize-none"
                      placeholder="Explique por qué el consumo real fue mayor al estimado..."
                    />
                    {errors.motivo && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <span>⚠️</span> {errors.motivo.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Mensajes de estado */}
              {serverError && (
                <div className="col-span-full relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl blur-lg" />
                  <div className="relative bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                    <span className="text-lg">❌</span>
                    <span>{serverError}</span>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="col-span-full flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-slate-600 text-slate-200 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={handleReset}
                >
                  🧹 Limpiar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                      Guardando...
                    </>
                  ) : isEditing ? (
                    <>✏️ Actualizar registro</>
                  ) : (
                    <>➕ Crear registro</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
