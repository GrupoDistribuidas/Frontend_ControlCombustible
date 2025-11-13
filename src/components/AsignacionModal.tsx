import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { UserCheck, X, Calendar, Truck, User, Route } from "lucide-react";
import {
  AsignacionCreateSchema,
  AsignacionUpdateSchema,
  type AsignacionCreateInput,
  type AsignacionUpdateInput,
} from "../validation/asignaciones";
import { asignacionesService } from "../services/asignaciones.service";
import TextField from "./TextField";
import Button from "./Button";
import type { Asignacion, Ruta, Chofer, Vehicle } from "../types/asignaciones";

export interface AsignacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAsignacion?: Asignacion | null;
  rutas: Ruta[];
  choferes: Chofer[];
  vehiculos: Vehicle[];
  onSuccess?: () => void;
}

export default function AsignacionModal({
  isOpen,
  onClose,
  editingAsignacion,
  rutas,
  choferes,
  vehiculos,
  onSuccess,
}: AsignacionModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const isEditing = !!editingAsignacion;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AsignacionCreateInput | AsignacionUpdateInput>({
    resolver: zodResolver(isEditing ? AsignacionUpdateSchema : AsignacionCreateSchema),
    defaultValues: {
      rutaId: 0,
      choferId: 0,
      vehiculoId: 0,
      fechaAsignacion: "",
    },
    mode: "onTouched",
  });

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingAsignacion) {
      reset({
        rutaId: editingAsignacion.ruta?.id || editingAsignacion.rutaId,
        choferId: editingAsignacion.chofer?.id || editingAsignacion.choferId,
        vehiculoId: editingAsignacion.vehiculo?.id || editingAsignacion.vehiculoId,
        fechaAsignacion: editingAsignacion.fechaAsignacion?.split('T')[0] || "",
      });
    } else {
      reset({
        rutaId: 0,
        choferId: 0,
        vehiculoId: 0,
        fechaAsignacion: "",
      });
    }
  }, [isOpen, isEditing, editingAsignacion, reset]);

  const onSubmit = async (data: AsignacionCreateInput | AsignacionUpdateInput) => {
    try {
      setServerError(null);
      setOkMsg(null);

      if (isEditing && editingAsignacion) {
        await asignacionesService.updateAsignacion(editingAsignacion.id, {
          ...data,
          id: editingAsignacion.id
        });
        toast.success("Asignación actualizada exitosamente");
      } else {
        await asignacionesService.createAsignacion(data);
        toast.success("Asignación creada exitosamente");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      let msg = error?.message || "Error al guardar la asignación";

      // Handle specific backend validation errors
      if (msg.includes("Vehículo no disponible")) {
        msg = "❌ El vehículo seleccionado no está disponible. Verifique que no tenga asignaciones activas.";
      } else if (msg.includes("Estados 'Asignada' o 'En Proceso' no están configurados")) {
        msg = "❌ Error de configuración: Los estados requeridos no están disponibles en la base de datos.";
      } else if (msg.includes("Error interno al crear asignación")) {
        msg = "❌ Error interno del servidor al crear la asignación. Contacte al administrador.";
      }

      setServerError(msg);
      console.error("Error saving asignacion:", error);
    }
  };

  const handleReset = () => {
    reset();
    setServerError(null);
    setOkMsg(null);
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
          <div className="bg-gradient-to-r from-emerald-500/10 to-lime-500/10 p-8 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl blur-lg opacity-50" />
                  <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-xl shadow-lg shadow-emerald-500/25">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                  {isEditing ? "✏️ Editar Asignación" : "➕ Nueva Asignación"}
                </h2>
                  <p className="text-slate-400 mt-1">
                    {isEditing ? "Modificar la asignación existente" : "Crear una nueva asignación de ruta"}
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
              {/* Ruta */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
                      <Route className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-slate-200">🛣️ Ruta</span>
                  </div>
                </label>
                <select
                  {...register("rutaId", { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-slate-100 placeholder-slate-400 transition-all duration-200"
                >
                  <option value={0}>Seleccionar ruta...</option>
                  {rutas.map((ruta) => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.nombre}
                    </option>
                  ))}
                </select>
                {errors.rutaId && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.rutaId.message}
                  </p>
                )}
              </div>

              {/* Chofer */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-slate-200">👤 Chofer</span>
                  </div>
                </label>
                <select
                  {...register("choferId", { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-slate-100 placeholder-slate-400 transition-all duration-200"
                >
                  <option value={0}>Seleccionar chofer...</option>
                  {choferes
                    .filter((chofer) =>
                      chofer.disponible ||
                      (isEditing && editingAsignacion && chofer.id === (editingAsignacion.chofer?.id || editingAsignacion.choferId))
                    )
                    .map((chofer) => (
                      <option key={chofer.id} value={chofer.id}>
                        {`${chofer.primerNombre} ${chofer.segundoNombre || ""} ${chofer.primerApellido} ${chofer.segundoApellido || ""}`.trim()} - {chofer.identificacion}
                        {!chofer.disponible && isEditing && editingAsignacion && chofer.id === (editingAsignacion.chofer?.id || editingAsignacion.choferId) && " (Actual)"}
                      </option>
                    ))}
                </select>
                {errors.choferId && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.choferId.message}
                  </p>
                )}
              </div>

              {/* Vehículo */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                      <Truck className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-slate-200">🚛 Vehículo</span>
                  </div>
                </label>
                <select
                  {...register("vehiculoId", { valueAsNumber: true })}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-slate-100 placeholder-slate-400 transition-all duration-200"
                >
                  <option value={0}>Seleccionar vehículo...</option>
                  {vehiculos
                    .filter((vehiculo) =>
                      vehiculo.disponible === "Disponible" ||
                      (isEditing && editingAsignacion && vehiculo.id === (editingAsignacion.vehiculo?.id || editingAsignacion.vehiculoId))
                    )
                    .map((vehiculo) => (
                      <option key={vehiculo.id} value={vehiculo.id}>
                        {vehiculo.nombre} - {vehiculo.placa} ({vehiculo.marca})
                        {vehiculo.disponible !== "Disponible" && isEditing && editingAsignacion && vehiculo.id === (editingAsignacion.vehiculo?.id || editingAsignacion.vehiculoId) && " (Actual)"}
                      </option>
                    ))}
                  {vehiculos.filter((vehiculo) =>
                    vehiculo.disponible === "Disponible" ||
                    (isEditing && editingAsignacion && vehiculo.id === (editingAsignacion.vehiculo?.id || editingAsignacion.vehiculoId))
                  ).length === 0 && (
                    <option disabled>No hay vehículos disponibles</option>
                  )}
                </select>
                {errors.vehiculoId && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.vehiculoId.message}
                  </p>
                )}
              </div>

              {/* Fecha de Asignación */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-slate-200">📅 Fecha de Asignación</span>
                  </div>
                </label>
                <TextField
                  type="date"
                  {...register("fechaAsignacion")}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-slate-100 transition-all duration-200"
                />
                {errors.fechaAsignacion && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {errors.fechaAsignacion.message}
                  </p>
                )}
              </div>
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
            {okMsg && (
              <div className="col-span-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-lg" />
                <div className="relative bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-sm text-green-300 flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span>{okMsg}</span>
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
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-lime-500 to-green-500 hover:from-emerald-600 hover:via-lime-600 hover:to-green-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                    Guardando...
                  </>
                ) : isEditing ? (
                  <>
                    ✏️ Actualizar asignación
                  </>
                ) : (
                  <>
                    ➕ Crear asignación
                  </>
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
