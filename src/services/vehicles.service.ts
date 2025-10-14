import { http } from "./http";
import type { TipoMaquinaria, VehicleCreate } from "../validation/vehicles";

const DISP_MAP: Record<string, string> = {
  Disponible: "Disponible",
  "En Mantenimiento": "En Mantenimiento",
  "No Disponible": "No Disponible",
};

// Utilidad para normalizar respuestas que a veces vienen como { data: [...] }
function unwrapArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  return [];
}

export const vehiclesService = {
  // GET /Tipos
  async getTipos(): Promise<TipoMaquinaria[]> {
    const { data } = await http.get("api/Tipos");
    return unwrapArray<TipoMaquinaria>(data);
  },

  // (Opcional) validación de placa única.
  // Intenta primero /Vehiculos/placa/{placa}; si no existe, prueba /vehicles/check-placa/{placa}
  async checkPlacaExists(placa: string): Promise<boolean> {
    try {
      const { data } = await http.get(`/Vehiculos/placa/${encodeURIComponent(placa)}`);
      // servidor puede devolver { exists: true } o 200/404; adapta si tu API es distinta
      if (typeof data?.exists === "boolean") return data.exists;
      // si devolvió el vehículo como objeto:
      if (data && typeof data === "object") return true;
      return false;
    } catch (err: any) {
      try {
        const { data } = await http.get(`/vehicles/check-placa/${encodeURIComponent(placa)}`);
        return !!data?.exists;
      } catch {
        return false;
      }
    }
  },

  // POST /Vehiculos
  async createVehicle(payload: VehicleCreate) {
    const apiPayload = {
      ...payload,
      disponible: DISP_MAP[payload.disponible] || "No Disponible",
    };
    const { data } = await http.post("api/Vehiculos", apiPayload);
    return data;
  },

  // PUT /Vehiculos/{id}
  async updateVehicle(id: number | string, payload: VehicleCreate) {
    const apiPayload = {
      ...payload,
      disponible: DISP_MAP[payload.disponible] || "No Disponible",
    };
    const { data } = await http.put(`api/Vehiculos/${id}`, apiPayload);
    return data;
  },

  // GET /Vehiculos
  async getVehicles(): Promise<any[]> {
    const { data } = await http.get("api/Vehiculos");
    return unwrapArray<any>(data);
  },
};
