import React, { useEffect, useState } from "react";
import { User, X } from "lucide-react";
import { usersService } from "../services/users.service";
import { choferesService } from "../services/choferes.service";
import Button from "./Button";
import type { User as UserType } from "../types/auth";
import type { Chofer } from "../types/drivers";

export interface AssignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  chofer: Chofer | null;
  onSuccess?: () => void;
}

export default function AssignUserModal({
  isOpen,
  onClose,
  chofer,
  onSuccess,
}: AssignUserModalProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar usuarios disponibles
  useEffect(() => {
    if (!isOpen) return;

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await usersService.getUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setServerError(e?.message ?? "Error al cargar usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId(0);
      setServerError(null);
    }
  }, [isOpen]);

  if (!isOpen || !chofer) return null;

  const handleSubmit = async () => {
    if (selectedUserId === 0) {
      setServerError("Seleccione un usuario");
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    try {
      await choferesService.asignarUsuario(chofer.id, selectedUserId);
      onSuccess?.();
      onClose();
    } catch (e: any) {
      console.error("Error al asignar usuario:", e);
      setServerError(e?.message ?? "No se pudo asignar el usuario");
    } finally {
      setIsSubmitting(false);
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
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-emerald-500/10">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                <User className="text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                  Asignar Usuario
                </h2>
                <p className="text-slate-400 text-sm">
                  Asigna un usuario al chofer {chofer.primerNombre} {chofer.primerApellido}
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
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm text-slate-300 font-medium">
                  Seleccionar Usuario
                </label>
                <select
                  disabled={loadingUsers}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  className={`w-full rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-emerald-500 focus:ring-0 text-slate-200 appearance-none ${
                    loadingUsers ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <option value={0}>
                    {loadingUsers ? "Cargando usuarios..." : "Seleccione un usuario"}
                  </option>
                  {users
                    .filter((u) => u.estado === 1 && !u.choferId) // Solo usuarios activos y sin chofer asignado
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombreUsuario} - {u.email}
                      </option>
                    ))}
                </select>
              </div>

              {/* mensajes */}
              {serverError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {serverError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedUserId === 0}
                  className="bg-gradient-to-r from-emerald-500 to-lime-500 hover:brightness-110 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? "Asignando..." : "Asignar Usuario"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
