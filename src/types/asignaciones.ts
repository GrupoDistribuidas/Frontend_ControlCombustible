import type { Ruta } from "./rutas";
import type { Chofer } from "./drivers";

export type { Ruta, Chofer };

export type Vehicle = {
  id: number;
  nombre: string;
  placa: string;
  marca: string;
  modelo: string;
  disponible: string;
  consumoCombustibleKm: number;
  capacidadCombustible: number;
  tipoMaquinariaId: number;
  estado: boolean;
};

export type EstadoAsignacion = {
  id: number;
  nombre: string;
  descripcion?: string;
};

export type Asignacion = {
  id: number;
  rutaId: number;
  choferId: number;
  vehiculoId: number;
  fechaAsignacion: string;
  estado: boolean;
  estadoAsignacion: string; // Nuevo campo para el estado de asignación
  ruta?: Ruta;
  chofer?: Chofer;
  vehiculo?: Vehicle;
  estadoAsignacionObj?: EstadoAsignacion; // Objeto completo del estado
};

export type AsignacionCreateInput = {
  rutaId: number;
  choferId: number;
  vehiculoId: number;
  fechaAsignacion?: string;
};

export type AsignacionUpdateInput = {
  id?: number;
  rutaId: number;
  choferId: number;
  vehiculoId: number;
  fechaAsignacion?: string;
};
