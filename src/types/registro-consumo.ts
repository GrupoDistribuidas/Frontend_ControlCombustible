export interface RegistroConsumo {
  id: number;
  asignacionRutaId: number;
  fechaRegistro: string;
  combustibleEstimado: number;
  combustibleReal: number;
  motivo?: string;
  estadoId: number;
  estadoNombre: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface AsignacionConDetalles {
  id: number;
  rutaId: number;
  choferId: number;
  vehiculoId: number;
  fechaAsignacion: string;
  combustibleEstimado: number;
  estadoId: number;
  ruta?: {
    id: number;
    nombre: string;
    distancia: number;
  };
  chofer?: {
    id: number;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
  };
  vehiculo?: {
    id: number;
    nombre: string;
    placa: string;
    marca: string;
    modelo: string;
    consumoCombustibleKm: number;
    capacidadCombustible: number;
  };
}
