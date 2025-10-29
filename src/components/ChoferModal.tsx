import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { User, X, CheckCircle } from "lucide-react";
import {
  ChoferCreateSchema,
  ChoferUpdateSchema,
  type ChoferCreateInput,
  type ChoferUpdateInput,
} from "../validation/drivers";
import { choferesService } from "../services/choferes.service";
import { usersService } from "../services/users.service";
import { vehiclesService } from "../services/vehicles.service";
import TextField from "./TextField";
import Button from "./Button";
import type { TipoMaquinaria } from "../validation/vehicles";
import type { Chofer } from "../types/drivers";

export interface ChoferModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingChofer?: Chofer | null;
  onSuccess?: () => void;
}

export default function ChoferModal({
  isOpen,
  onClose,
  editingChofer,
  onSuccess,
}: ChoferModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const isEditing = !!editingChofer;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChoferCreateInput | ChoferUpdateInput>({
    resolver: zodResolver(isEditing ? ChoferUpdateSchema : ChoferCreateSchema),
    defaultValues: {
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      ...(isEditing
        ? {}
        : {
            identificacion: "",
            fechaNacimiento: "",
            disponible: true,
            usuarioId: 0,
          }),
      tipoMaquinariaId: 0,
    },
    mode: "onTouched",
  });

  // Cargar datos para edición
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingChofer) {
      reset({
        primerNombre: editingChofer.primerNombre,
        segundoNombre: editingChofer.segundoNombre || "",
        primerApellido: editingChofer.primerApellido,
        segundoApellido: editingChofer.segundoApellido || "",
        identificacion: editingChofer.identificacion,
        fechaNacimiento: editingChofer.fechaNacimiento.split("T")[0],
        tipoMaquinariaId: editingChofer.tipoMaquinariaId,
      });
    } else {
      reset({
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        identificacion: "",
        fechaNacimiento: "",
        disponible: true,
        usuarioId: 0,
        tipoMaquinariaId: 0,
      });
    }
  }, [isOpen, isEditing, editingChofer, reset]);

  // Cargar usuarios y tipos
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoadingTipos(true);
        setLoadingUsers(true);

        const [tiposData, usersData] = await Promise.all([
          vehiclesService.getTipos(),
          usersService.getUsers(),
        ]);

        setTipos(Array.isArray(tiposData) ? tiposData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (e: any) {
        setServerError(e?.message ?? "Error al cargar datos");
      } finally {
        setLoadingTipos(false);
        setLoadingUsers(false);
      }
    };

    loadData();
  }, [isOpen]);

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

  const onSubmit = async (values: ChoferCreateInput | ChoferUpdateInput) => {
    setServerError(null);
    setOkMsg(null);

    console.log("Iniciando submit del formulario", { isEditing, values });

    try {
      if (isEditing && editingChofer) {
        console.log("Actualizando chofer:", editingChofer.id);
        await choferesService.updateChofer(
          editingChofer.id,
          values as ChoferUpdateInput
        );
        console.log("Chofer actualizado exitosamente, mostrando toast");
        const toastId = toast.success("✅ Chofer actualizado exitosamente.", {
          duration: 5000,
        });
        console.log("Toast ID generado:", toastId);
      } else {
        console.log("Creando nuevo chofer");
        await choferesService.createChofer(values as ChoferCreateInput);
        console.log("Chofer creado exitosamente, mostrando toast");
        toast.success("✅ Chofer registrado correctamente.", {
          duration: 5000,
          style: {
            background: '#10b981',
            color: '#ffffff',
            border: '1px solid #059669',
          },
        });
      }
      reset();
      onSuccess?.();
      // onClose(); // si quieres cerrar automáticamente
    } catch (e: any) {
      console.error("Error al procesar chofer:", e);
      const msg = e?.message ?? "❌ No se pudo procesar el chofer";
      if (String(msg).toLowerCase().includes("identificacion")) {
        setError("identificacion", {
          type: "server",
          message: "La identificación ya está registrada.",
        });
      } else {
        console.log("Mostrando toast de error:", msg);
        toast.error(msg, {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#ffffff',
            border: '1px solid #dc2626',
          },
        });
      }
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
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-emerald-500/10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                  <User className="text-emerald-400 w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                    {isEditing ? "Editar Chofer" : "Nuevo Chofer"}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {isEditing
                      ? "Modifica los datos del chofer."
                      : "Completa los datos del chofer para agregarlo al sistema."}
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Nombres */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Primer nombre
                    </label>
                    <TextField
                      {...register("primerNombre")}
                      placeholder="Ej. Juan"
                      autoComplete="given-name"
                      className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                    />
                    {errors.primerNombre && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.primerNombre.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Segundo nombre
                    </label>
                    <TextField
                      {...register("segundoNombre")}
                      placeholder="Ej. Carlos"
                      autoComplete="additional-name"
                      className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Primer apellido
                    </label>
                    <TextField
                      {...register("primerApellido")}
                      placeholder="Ej. Pérez"
                      autoComplete="family-name"
                      className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                    />
                    {errors.primerApellido && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.primerApellido.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Segundo apellido
                    </label>
                    <TextField
                      {...register("segundoApellido")}
                      placeholder="Ej. González"
                      autoComplete="family-name"
                      className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                    />
                  </div>

                  {/* Identificación */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Identificación
                    </label>
                    <TextField
                      {...register("identificacion")}
                      placeholder="Ej. 0123456789"
                      inputMode="numeric"
                      autoComplete="off"
                      disabled={isEditing}
                      className={`bg-slate-900/60 border border-slate-700 focus:border-emerald-500 ${
                        isEditing ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.identificacion && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.identificacion.message}
                      </p>
                    )}
                    {isEditing && (
                      <p className="mt-1 text-xs text-slate-500">
                        La identificación no se puede modificar al editar.
                      </p>
                    )}
                  </div>

                  {/* Fecha de nacimiento */}
                  <div>
                    <label className="mb-1 block text-sm text-slate-300 font-medium">
                      Fecha de nacimiento
                    </label>
                    <TextField
                      type="date"
                      {...register("fechaNacimiento")}
                      disabled={isEditing}
                      className={`bg-slate-900/60 border border-slate-700 focus:border-emerald-500 ${
                        isEditing ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.fechaNacimiento && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.fechaNacimiento.message}
                      </p>
                    )}
                    {isEditing && (
                      <p className="mt-1 text-xs text-slate-500">
                        La fecha de nacimiento no se puede modificar al editar.
                      </p>
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
                      {...register("tipoMaquinariaId", { valueAsNumber: true })}
                    >
                      <option value={0} disabled>
                        {loadingTipos ? "Cargando tipos..." : "Seleccione un tipo"}
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

                  {/* Usuario - Solo en creación */}
                  {!isEditing && (
                    <div>
                      <label className="mb-1 block text-sm text-slate-300 font-medium">
                        Usuario asignado
                      </label>
                      <select
                        disabled={loadingUsers}
                        className={`w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 text-slate-200 appearance-none ${
                          loadingUsers ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                        {...register("usuarioId", {
                          setValueAs: (v) => parseInt(v, 10),
                        })}
                      >
                        <option value={0}>
                          {loadingUsers ? "Cargando usuarios..." : "Sin asignar"}
                        </option>
                        {users
                          .filter((u) => u.estado === 1 && !u.choferId)
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.nombreUsuario} - {u.email}
                            </option>
                          ))}
                      </select>
                      {errors.usuarioId && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.usuarioId.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Disponible - Solo en creación */}
                  {!isEditing && (
                    <div>
                      <label className="mb-1 block text-sm text-slate-300 font-medium">
                        Estado (disponible)
                      </label>
                      <select
                        className="w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 text-slate-200 appearance-none"
                        {...register("disponible", {
                          setValueAs: (v) => v === "true",
                        })}
                      >
                        <option value={"true"}>Disponible</option>
                        <option value={"false"}>No disponible</option>
                      </select>
                    </div>
                  )}
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
                      ? "Actualizar chofer"
                      : "Registrar chofer"}
                  </Button>
                </div>
              </form>
            </div>
            {/* <- CIERRA el CARD */}
          </div>
          {/* <- CIERRA el WRAPPER centrado */}
        </div>
        {/* <- CIERRA el overlay fixed */}
      </div>
    </>
  );
}
