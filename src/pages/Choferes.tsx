import { useEffect, useState, useMemo } from "react";
import { User, Edit, Plus, Power, CheckCircle, XCircle, UserPlus } from "lucide-react";

import ChoferModal from "../components/ChoferModal";
import AssignUserModal from "../components/AssignUserModal";

import { choferesService } from "../services/choferes.service";
import { vehiclesService } from "../services/vehicles.service";
import type { Chofer } from "../types/drivers";
import type { TipoMaquinaria } from "../validation/vehicles";

export default function Choferes() {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([]);
  const [loadingChoferes, setLoadingChoferes] = useState(true);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChofer, setEditingChofer] = useState<Chofer | null>(null);
  const [isAssignUserModalOpen, setIsAssignUserModalOpen] = useState(false);
  const [assigningChofer, setAssigningChofer] = useState<Chofer | null>(null);

  // map de tipos
  const tiposMap = useMemo(() => {
    const map = new Map<number, string>();
    tipos.forEach((t) => map.set(t.id, t.nombre));
    return map;
  }, [tipos]);

  // Cargar Tipos
  useEffect(() => {
    (async () => {
      try {
        setLoadingTipos(true);
        const data = await vehiclesService.getTipos();
        setTipos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("No se pudieron cargar los tipos de maquinaria");
      } finally {
        setLoadingTipos(false);
      }
    })();
  }, []);

  // Cargar Choferes
  useEffect(() => {
    loadChoferes();
  }, []);

  const loadChoferes = async () => {
    try {
      setLoadingChoferes(true);
      const data = await choferesService.getChoferes();
      setChoferes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("No se pudieron cargar los choferes");
    } finally {
      setLoadingChoferes(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingChofer(null);
  };

  const openAssignUserModal = (chofer: Chofer) => {
    setAssigningChofer(chofer);
    setIsAssignUserModalOpen(true);
  };

  const closeAssignUserModal = () => {
    setIsAssignUserModalOpen(false);
    setAssigningChofer(null);
  };

  const handleEdit = (chofer: Chofer) => {
    setEditingChofer(chofer);
    openModal();
  };

  const handleToggleEstado = async (chofer: Chofer) => {
    try {
      await choferesService.updateChoferEstado(chofer.id, !chofer.estado);
      loadChoferes();
    } catch (e: any) {
      console.error("Error al cambiar estado del chofer:", e);
    }
  };

  const handleToggleDisponibilidad = async (chofer: Chofer) => {
    try {
      await choferesService.updateChoferDisponibilidad(chofer.id, !chofer.disponible);
      loadChoferes();
    } catch (e: any) {
      console.error("Error al cambiar disponibilidad del chofer:", e);
    }
  };

  const handleAsignarUsuario = (chofer: Chofer) => {
    openAssignUserModal(chofer);
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado + Acciones (botón compacto, no estirado) */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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

        {/* Botón NUEVO CHOFER — compacto, cuadrado y en un solo lugar */}
        <button
          onClick={openModal}
          className="
            inline-flex w-auto items-center gap-2
            rounded-lg px-4 h-10
            bg-gradient-to-r from-emerald-500 to-lime-500
            text-white font-semibold
            shadow-lg shadow-emerald-500/20
            hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-400/50
            transition
          "
          title="Agregar nuevo chofer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Chofer</span>
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        {/* Tabla de Choferes */}
        <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-emerald-500/5">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">Lista de Choferes</h2>
          {loadingChoferes ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <p className="mt-2 text-slate-400">Cargando choferes...</p>
            </div>
          ) : choferes.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No hay choferes registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3">Nombre Completo</th>
                    <th className="px-6 py-3">Identificación</th>
                    <th className="px-6 py-3">Usuario</th>
                    <th className="px-6 py-3">Tipo Maquinaria</th>
                    <th className="px-6 py-3">Disponible</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {choferes.map((chofer) => (
                    <tr key={chofer.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-6 py-4 text-slate-200">
                        {chofer.primerNombre} {chofer.segundoNombre} {chofer.primerApellido} {chofer.segundoApellido}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{chofer.identificacion}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {chofer.usuario ? chofer.usuario.nombreUsuario : "Sin asignar"}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {tiposMap.get(chofer.tipoMaquinariaId) ?? "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleDisponibilidad(chofer)}
                          className={`flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium transition-colors ${
                            chofer.disponible
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}
                          title={chofer.disponible ? "Marcar como no disponible" : "Marcar como disponible"}
                        >
                          {chofer.disponible ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-400" />
                          )}
                          {chofer.disponible ? "Disponible" : "No disponible"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleEstado(chofer)}
                          className={`flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium transition-colors ${
                            chofer.estado
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          }`}
                          title={chofer.estado ? "Desactivar chofer" : "Activar chofer"}
                        >
                          <Power className={`w-3 h-3 ${chofer.estado ? "text-blue-400" : "text-gray-400"}`} />
                          {chofer.estado ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(chofer)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!chofer.usuarioId && (
                            <button
                              onClick={() => handleAsignarUsuario(chofer)}
                              className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
                              title="Asignar usuario"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal del Formulario */}
        <ChoferModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingChofer={editingChofer}
          onSuccess={() => {
            loadChoferes();
            closeModal();
          }}
        />

        {/* Modal para asignar usuario */}
        <AssignUserModal
          isOpen={isAssignUserModalOpen}
          onClose={closeAssignUserModal}
          chofer={assigningChofer}
          onSuccess={() => {
            loadChoferes();
            closeAssignUserModal();
          }}
        />
      </div>

      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>
    </div>
  );
}
