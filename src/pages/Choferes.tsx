import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";

import TextField from "../components/TextField";
import Button from "../components/Button";

import type { TipoMaquinaria } from "../validation/vehicles";
import { ChoferCreateSchema, type ChoferCreateInput } from "../validation/drivers";
import { vehiclesService } from "../services/vehicles.service";
import { choferesService } from "../services/choferes.service";
import { usersService } from "../services/users.service";
import type { User as UserType } from "../types/auth";

const MAX_FAKE = 100; // Indicador lateral (decorativo)

export default function Choferes() {
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChoferCreateInput>({
    resolver: zodResolver(ChoferCreateSchema),
    defaultValues: {
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      identificacion: "",
      fechaNacimiento: "",
      disponible: true,
      usuarioId: 0,
      tipoMaquinariaId: 0,
    },
    mode: "onTouched",
  });

  // Cargar Tipos
  useEffect(() => {
    (async () => {
      try {
        setLoadingTipos(true);
        const data = await vehiclesService.getTipos();
        setTipos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setServerError(e?.message ?? "No se pudieron cargar los tipos de maquinaria");
      } finally {
        setLoadingTipos(false);
      }
    })();
  }, []);

  // Cargar Usuarios
  useEffect(() => {
    (async () => {
      try {
        setLoadingUsers(true);
        const data = await usersService.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setServerError(e?.message ?? "No se pudieron cargar los usuarios");
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  // Ocultar mensaje OK
  useEffect(() => {
    if (!okMsg) return;
    const t = setTimeout(() => setOkMsg(null), 3500);
    return () => clearTimeout(t);
  }, [okMsg]);

  const handleReset = () => {
    reset();
    setOkMsg(null);
    setServerError(null);
  };

  const onSubmit = async (values: ChoferCreateInput) => {
    setServerError(null);
    setOkMsg(null);

    try {
      const response = await choferesService.createChofer(values);
      console.log("Respuesta del backend:", response);
      setOkMsg("✅ Chofer registrado correctamente.");
      reset();
    } catch (e: any) {
      console.error("Error al registrar chofer:", e);
      const msg = e?.message ?? "❌ No se pudo registrar el chofer";
      if (String(msg).toLowerCase().includes("identificacion")) {
        setError("identificacion", {
          type: "server",
          message: "La identificación ya está registrada.",
        });
      } else {
        setServerError(msg);
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
          <User className="text-emerald-400 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">
            Registro de Choferes
          </h1>
          <p className="text-slate-400">
            Crea un nuevo chofer manteniendo el inventario de personal de tu flota.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        {/* Formulario */}
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-emerald-500/5">
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
                  <p className="mt-1 text-sm text-red-400">{errors.primerNombre.message}</p>
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
                  <p className="mt-1 text-sm text-red-400">{errors.primerApellido.message}</p>
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
                  placeholder="Solo números (7 a 12 dígitos)"
                  inputMode="numeric"
                  autoComplete="off"
                  className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                />
                {errors.identificacion && (
                  <p className="mt-1 text-sm text-red-400">{errors.identificacion.message}</p>
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
                  className="bg-slate-900/60 border border-slate-700 focus:border-emerald-500"
                />
                {errors.fechaNacimiento && (
                  <p className="mt-1 text-sm text-red-400">{errors.fechaNacimiento.message}</p>
                )}
              </div>

              {/* Usuario */}
              <div>
                <label className="mb-1 block text-sm text-slate-300 font-medium">
                  Usuario
                </label>
                <select
                  disabled={loadingUsers}
                  className={`w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-0 text-slate-200 appearance-none ${
                    loadingUsers ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  {...register("usuarioId", { valueAsNumber: true })}
                >
                  <option value={0}>Ninguno</option>
                  {users
                    .filter((u) => u.estado === 1)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombreUsuario}
                      </option>
                    ))}
                </select>
                {errors.usuarioId && (
                  <p className="mt-1 text-sm text-red-400">{errors.usuarioId.message}</p>
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
                  <p className="mt-1 text-sm text-red-400">{errors.tipoMaquinariaId.message}</p>
                )}
              </div>

              {/* Disponible */}
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

            {/* Botones mitad-mitad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleReset}
                className="w-full h-12 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 text-slate-200 font-medium shadow hover:shadow-md transition"
              >
                Limpiar
              </Button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Guardando..." : "Registrar chofer"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>
    </div>
  );
}
