// ==== KPIs ====
export interface KPI {
  vehiculos: {
    totalActivos: number;
    totalInactivos: number;
    totalGeneral: number;
  };
  choferes: {
    totalActivos: number;
    totalInactivos: number;
    totalDisponibles: number;
    totalGeneral: number;
  };
  rutas: {
    totalActivas: number;
    totalInactivas: number;
    totalGeneral: number;
    distanciaTotal: number;
  };
  combustible: {
    consumoPromedio: number;
    totalRegistros: number;
  };
}

// Consumo promedio general
export interface ConsumoPromedio {
  consumoPromedio: number;
  totalRegistros: number;
}

// Consumo por ruta (según swagger)
export interface ConsumoPorRuta {
  rutaId: number;
  rutaNombre: string;
  consumoPromedio: number;
  totalViajes: number;
  combustibleTotalEstimado: number;
  combustibleTotalReal: number;
}

// Vehículos totales
export interface VehiculosTotales {
  totalActivos: number;
  totalInactivos: number;
  totalGeneral: number;
}

// Vehículos por tipo
export interface VehiculosPorTipo {
  tipoMaquinariaId: number;
  tipoNombre: string;
  cantidad: number;
  porcentaje?: number; // opcional si luego lo calculas en el frontend
}

// Vehículos por estado
export interface VehiculosPorEstado {
  disponibilidad: string;
  cantidad: number;
  porcentaje?: number;
}

// Choferes totales
export interface ChoferesTotales {
  totalActivos: number;
  totalInactivos: number;
  totalDisponibles: number;
  totalGeneral: number;
}

// Rutas totales
export interface RutasTotales {
  totalActivas: number;
  totalInactivas: number;
  totalGeneral: number;
  distanciaTotal: number;
}

// Rutas por provincia
export interface RutasPorProvincia {
  provincia: string;
  totalRutas: number;
  distanciaTotal: number;
  rutasActivas: number;
  rutasInactivas: number;
}

// Puntos por tipo
export interface PuntosPorTipo {
  tipoPunto: string;
  cantidad: number;
  provinciaPrincipal: string;
}

// Puntos más utilizados
export interface PuntoMasUtilizado {
  puntoId: number;
  nombrePunto: string;
  provincia: string;
  tipoPunto: string;
  vecesComoInicio: number;
  vecesComoFin: number;
  totalUsos: number;
}

// Consumo por tipo de vehículo
export interface ConsumoPorTipoVehiculo {
  tipoVehiculoId: number;
  tipoVehiculoNombre: string;
  consumoPromedioReal: number;
  consumoPromedioEstimado: number;
  desviacionPromedio: number;
  totalViajes: number;
  combustibleTotalReal: number;
}

// Desviaciones de combustible
export interface DesviacionCombustible {
  registroId: number;
  asignacionId: number;
  rutaId: number;
  rutaNombre: string;
  vehiculoId: number;
  vehiculoNombre: string;
  combustibleEstimado: number;
  combustibleReal: number;
  desviacion: number;
  porcentajeDesviacion: number;
  motivo: string;
}

// Vehículos eficientes / ineficientes
export interface VehiculoEficiente {
  vehiculoId: number;
  vehiculoNombre: string;
  vehiculoPlaca: string;
  tipoVehiculo: string;
  ratioEficiencia: number;
  totalViajes: number;
  consumoPromedioReal: number;
  ahorroCombustible: number;
}

// Asignaciones por estado
export interface AsignacionesPorEstado {
  estadoNombre: string;
  totalAsignaciones: number;
  choferesAsignados: number;
  vehiculosAsignados: number;
}
