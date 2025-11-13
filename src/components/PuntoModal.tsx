import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { MapPin, X } from "lucide-react";
import {
  PuntoCreateSchema,
  PuntoUpdateSchema,
  type PuntoCreateInput,
  type PuntoUpdateInput,
} from "../validation/puntos";
import { puntosService } from "../services/puntos.service";
import TextField from "./TextField";
import Button from "./Button";
import type { Punto } from "../types/rutas";

export interface PuntoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPunto?: Punto | null;
  onSuccess?: () => void;
}

export default function PuntoModal({
  isOpen,
  onClose,
  editingPunto,
  onSuccess,
}: PuntoModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const isEditing = !!editingPunto;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PuntoCreateInput | PuntoUpdateInput>({
    resolver: zodResolver(isEditing ? PuntoUpdateSchema : PuntoCreateSchema),
    defaultValues: {
      nombre: "",
      direccion: "",
      provincia: "",
      tipoPunto: "",
    },
    mode: "onTouched",
  });

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingPunto) {
      reset({
        nombre: editingPunto.nombre,
        direccion: editingPunto.direccion,
        provincia: editingPunto.provincia,
        tipoPunto: editingPunto.tipoPunto,
      });
    } else {
      reset({
        nombre: "",
        direccion: "",
        provincia: "",
        tipoPunto: "",
      });
    }
  }, [isOpen, isEditing, editingPunto, reset]);

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

  const onSubmit = async (values: PuntoCreateInput | PuntoUpdateInput) => {
    setServerError(null);
    setOkMsg(null);

    try {
      if (isEditing && editingPunto) {
        await puntosService.updatePunto(
          editingPunto.id,
          values as PuntoUpdateInput
        );
        toast.success("✅ Punto actualizado exitosamente.", {
          duration: 5000,
        });
      } else {
        await puntosService.createPunto(values as PuntoCreateInput);
        toast.success("✅ Punto registrado correctamente.", {
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
      const msg = e?.message ?? "❌ No se pudo procesar el punto";
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
                  <MapPin className="text-blue-400 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-blue-400">
                    {isEditing ? "Editar Punto" : "Nuevo Punto"}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {isEditing
                      ? "Modifica los datos del punto."
                      : "Completa los datos del punto para agregarlo al sistema."}
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
                    Nombre del punto
                  </label>
                  <TextField
                    {...register("nombre")}
                    placeholder="Envio a la ciudad ..."
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
                  {/* Dirección */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Dirección
                    </label>
                    <TextField
                      {...register("direccion")}
                      placeholder="Ambato"
                      autoComplete="off"
                      className="bg-slate-900/60 border border-slate-700 focus:border-blue-500"
                    />
                    {errors.direccion && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.direccion.message}
                      </p>
                    )}
                  </div>

                  {/* Provincia */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Provincia
                    </label>
                    <TextField
                      {...register("provincia")}
                      placeholder="Tungurahua"
                      autoComplete="off"
                      className="bg-slate-900/60 border border-slate-700 focus:border-blue-500"
                    />
                    {errors.provincia && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.provincia.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tipo de Punto */}
                <div>
                  <label className="mb-1 block text-sm text-slate-300 font-medium">
                    Tipo de Punto
                  </label>
                  <TextField
                    {...register("tipoPunto")}
                    placeholder="Estación, Terminal, Punto de Control..."
                    autoComplete="off"
                    className="bg-slate-900/60 border border-slate-700 focus:border-blue-500"
                  />
                  {errors.tipoPunto && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.tipoPunto.message}
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
                      ? "Actualizar punto"
                      : "Registrar punto"}
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
