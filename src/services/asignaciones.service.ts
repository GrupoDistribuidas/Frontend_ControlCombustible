import { http } from "./http";
import type { AsignacionCreateInput, AsignacionUpdateInput } from "../types/asignaciones";

export const asignacionesService = {
  async getAsignaciones(): Promise<any[]> {
    const { data } = await http.get("/api/Asignaciones");
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getAsignacionById(id: number): Promise<any> {
    const { data } = await http.get(`/api/Asignaciones/${id}`);
    return data?.data || data;
  },

  async createAsignacion(payload: AsignacionCreateInput) {
    const { data } = await http.post("/api/Asignaciones", payload);
    return data;
  },

  async updateAsignacion(id: number, payload: Partial<AsignacionUpdateInput>) {
    const { data } = await http.put(`/api/Asignaciones/${id}`, payload);
    return data;
  },

  async deleteAsignacion(id: number) {
    const { data } = await http.delete(`/api/Asignaciones/${id}`);
    return data;
  },

  async updateAsignacionEstado(id: number, estado: boolean) {
    const { data } = await http.patch(`/api/Asignaciones/${id}/estado`, { estado });
    return data;
  },

  async getAsignacionesByChofer(choferId: number): Promise<any[]> {
    const { data } = await http.get(`/api/Asignaciones/chofer/${choferId}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getAsignacionesByVehiculo(vehiculoId: number): Promise<any[]> {
    const { data } = await http.get(`/api/Asignaciones/vehiculo/${vehiculoId}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getAsignacionesByEstado(estadoNombre: string): Promise<any[]> {
    const { data } = await http.get(`/api/Asignaciones/estado/${estadoNombre}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async searchAsignaciones(term: string): Promise<any[]> {
    const { data } = await http.get(`/api/asignaciones/search/${term}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },
};
