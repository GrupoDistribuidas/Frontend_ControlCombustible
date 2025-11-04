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

export type Asignacion = {
  id: number;
  rutaId: number;
  choferId: number;
  vehiculoId: number;
  fechaAsignacion: string;
  estado: boolean;
  ruta?: Ruta;
  chofer?: Chofer;
  vehiculo?: Vehicle;
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
