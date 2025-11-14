// src/services/reports.service.ts
import { http } from "./http";
import type {
  KPI,
  ConsumoPromedio,
  ConsumoPorRuta,
  VehiculosTotales,
  VehiculosPorTipo,
  VehiculosPorEstado,
  ChoferesTotales,
  RutasTotales,
  RutasPorProvincia,
  PuntosPorTipo,
  PuntoMasUtilizado,
  ConsumoPorTipoVehiculo,
  DesviacionCombustible,
  VehiculoEficiente,
  AsignacionesPorEstado,
} from "../types/reports";

export const reportsService = {
  // KPIs principales del dashboard
  async getKPIs(): Promise<KPI> {
    const { data } = await http.get("api/Reportes/kpis");
    return data;
  },

  // Consumo promedio general
  async getConsumoPromedio(): Promise<ConsumoPromedio> {
    const { data } = await http.get("api/Reportes/combustible/promedio");
    return data;
  },

  // Consumo por ruta
  async getConsumoPorRuta(): Promise<ConsumoPorRuta[]> {
    const { data } = await http.get("api/Reportes/combustible/por-ruta");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Vehículos totales
  async getVehiculosTotales(): Promise<VehiculosTotales> {
    const { data } = await http.get("api/Reportes/vehiculos/totales");
    return data;
  },

  // Vehículos por tipo
  async getVehiculosPorTipo(): Promise<VehiculosPorTipo[]> {
    const { data } = await http.get("api/Reportes/vehiculos/por-tipo");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Vehículos por estado
  async getVehiculosPorEstado(): Promise<VehiculosPorEstado[]> {
    const { data } = await http.get("api/Reportes/vehiculos/por-estado");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Choferes totales
  async getChoferesTotales(): Promise<ChoferesTotales> {
    const { data } = await http.get("api/Reportes/choferes/totales");
    return data;
  },

  // Rutas totales
  async getRutasTotales(): Promise<RutasTotales> {
    const { data } = await http.get("api/Reportes/rutas/totales");
    return data;
  },

  // Rutas por provincia
  async getRutasPorProvincia(): Promise<RutasPorProvincia[]> {
    const { data } = await http.get("api/Reportes/rutas-por-provincia");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Puntos por tipo
  async getPuntosPorTipo(): Promise<PuntosPorTipo[]> {
    const { data } = await http.get("api/Reportes/puntos-por-tipo");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Puntos más utilizados
  async getPuntosMasUtilizados(): Promise<PuntoMasUtilizado[]> {
    const { data } = await http.get("api/Reportes/puntos-mas-utilizados");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Consumo por tipo de vehículo
  async getConsumoPorTipoVehiculo(): Promise<ConsumoPorTipoVehiculo[]> {
    const { data } = await http.get("api/Reportes/consumo-por-tipo-vehiculo");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Desviaciones de combustible
  async getDesviacionesCombustible(): Promise<DesviacionCombustible[]> {
    const { data } = await http.get("api/Reportes/desviaciones-combustible");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Vehículos más eficientes
  async getVehiculosMasEficientes(): Promise<VehiculoEficiente[]> {
    const { data } = await http.get("api/Reportes/vehiculos-mas-eficientes");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Vehículos menos eficientes
  async getVehiculosMenosEficientes(): Promise<VehiculoEficiente[]> {
    const { data } = await http.get("api/Reportes/vehiculos-menos-eficientes");
    return Array.isArray(data) ? data : data?.data || [];
  },

  // Asignaciones por estado
  async getAsignacionesPorEstado(): Promise<AsignacionesPorEstado[]> {
    const { data } = await http.get("api/Reportes/asignaciones-por-estado");
    return Array.isArray(data) ? data : data?.data || [];
  },
};
