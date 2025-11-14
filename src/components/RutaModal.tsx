import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { X, Route } from "lucide-react";
import {
  RutaCreateSchema,
  RutaUpdateSchema,
  type RutaCreateInput,
  type RutaUpdateInput,
} from "../validation/rutas";
import { rutasService } from "../services/rutas.service";
import { puntosService } from "../services/puntos.service";
import TextField from "./TextField";
import Button from "./Button";
import type { Ruta, Punto } from "../types/rutas";

export interface RutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRuta?: Ruta | null;
  onSuccess?: () => void;
}

export default function RutaModal({
  isOpen,
  onClose,
  editingRuta,
  onSuccess,
}: RutaModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [loadingPuntos, setLoadingPuntos] = useState(true);

  const isEditing = !!editingRuta;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RutaCreateInput | RutaUpdateInput>({
    resolver: zodResolver(isEditing ? RutaUpdateSchema : RutaCreateSchema),
    defaultValues: {
      nombre: "",
      puntoInicioId: 0,
      puntoFinId: 0,
      distancia: 0,
    },
    mode: "onTouched",
  });

  const puntoInicioId = watch("puntoInicioId");
  const puntoFinId = watch("puntoFinId");

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingRuta) {
      reset({
        nombre: editingRuta.nombre,
        puntoInicioId: editingRuta.puntoInicioId,
        puntoFinId: editingRuta.puntoFinId,
        distancia: editingRuta.distancia,
      });
    } else {
      reset({
        nombre: "",
        puntoInicioId: 0,
        puntoFinId: 0,
        distancia: 0,
      });
    }
  }, [isOpen, isEditing, editingRuta, reset]);

  // Cargar puntos
  useEffect(() => {
    if (!isOpen) return;

    const loadPuntos = async () => {
      try {
        setLoadingPuntos(true);
        const puntosData = await puntosService.getPuntos();
        setPuntos(Array.isArray(puntosData) ? puntosData : []);
      } catch (e: any) {
        setServerError(e?.message ?? "Error al cargar puntos");
      } finally {
        setLoadingPuntos(false);
      }
    };

    loadPuntos();
  }, [isOpen]);

  // Validación en tiempo real para puntos diferentes
  useEffect(() => {
    if (puntoInicioId && puntoFinId && puntoInicioId === puntoFinId) {
      setError("puntoFinId", {
        type: "manual",
        message: "El punto de inicio y final deben ser diferentes",
      });
    } else {
      // Limpiar error si ya no aplica
      if (errors.puntoFinId?.type === "manual") {
        setError("puntoFinId", {});
      }
    }
  }, [puntoInicioId, puntoFinId, setError, errors.puntoFinId]);

  // Ocultar mensaje OK
  useEffect(() => {
    if (!okMsg) return;
    const t = setTimeout(() => setOkMsg(null), 3500);
    return () => clearTimeout(t);
  }, [okMsg]);

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

  const handleReset = () => {
    reset();
    setOkMsg(null);
    setServerError(null);
  };

  const onSubmit = async (values: RutaCreateInput | RutaUpdateInput) => {
    setServerError(null);
    setOkMsg(null);

    try {
      if (isEditing && editingRuta) {
        await rutasService.updateRuta(
          editingRuta.id,
          values as RutaUpdateInput
        );
        toast.success("✅ Ruta actualizada exitosamente.", {
          duration: 5000,
        });
      } else {
        await rutasService.createRuta(values as RutaCreateInput);
        toast.success("✅ Ruta registrada correctamente.", {
          duration: 5000,
          style: {
            background: "#10b981",
            color: "#ffffff",
            border: "1px solid #059669",
          },
        });
      }
      reset();
      onSuccess?.();
    } catch (e: any) {
      const msg = e?.message ?? "❌ No se pudo procesar la ruta";
      toast.error(msg, {
        duration: 5000,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 z-[100]">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Wrapper centrado */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* CARD del modal */}
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-blue-500/10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30">
                  <Route className="text-blue-400 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-blue-400">
                    {isEditing ? "Editar Ruta" : "Nueva Ruta"}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {isEditing
                      ? "Modifica los datos de la ruta."
                      : "Completa los datos de la ruta para agregarla al sistema."}
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Nombre */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Nombre de la ruta
                  </label>
                  <TextField
                    {...register("nombre")}
                    placeholder="Ej. Ruta Principal"
                    autoComplete="off"
                    className="bg-slate-900/60 border border-slate-700 focus:border-blue-500"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Punto de inicio */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Punto de inicio
                    </label>
                    <select
                      disabled={loadingPuntos}
                      className={`w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 focus:ring-0 text-slate-200 appearance-none ${
                        loadingPuntos ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      {...register("puntoInicioId", { valueAsNumber: true })}
                    >
                      <option value={0} disabled>
                        {loadingPuntos
                          ? "Cargando puntos..."
                          : "Seleccione punto de inicio"}
                      </option>
                      {puntos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} - {p.provincia}
                        </option>
                      ))}
                    </select>
                    {errors.puntoInicioId && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.puntoInicioId.message}
                      </p>
                    )}
                  </div>

                  {/* Punto final */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Punto final
                    </label>
                    <select
                      disabled={loadingPuntos}
                      className={`w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 focus:ring-0 text-slate-200 appearance-none ${
                        loadingPuntos ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      {...register("puntoFinId", { valueAsNumber: true })}
                    >
                      <option value={0} disabled>
                        {loadingPuntos
                          ? "Cargando puntos..."
                          : "Seleccione punto final"}
                      </option>
                      {puntos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} - {p.provincia}
                        </option>
                      ))}
                    </select>
                    {errors.puntoFinId && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.puntoFinId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Distancia */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Distancia (km)
                  </label>
                  <TextField
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register("distancia", { valueAsNumber: true })}
                    placeholder="Ej. 150.50"
                    className="bg-slate-900/60 border border-slate-700 focus:border-blue-500"
                  />
                  {errors.distancia && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.distancia.message}
                    </p>
                  )}
                </div>

                {/* mensajes */}
                {serverError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {serverError}
                  </div>
                )}
                {okMsg && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
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
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:brightness-110 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : isEditing
                      ? "Actualizar ruta"
                      : "Registrar ruta"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
