import { http } from "./http";
import type { TipoMaquinaria, VehicleCreate } from "../validation/vehicles";

const DISP_MAP: Record<string, string> = {
  Disponible: "Disponible",
  "En Mantenimiento": "En Mantenimiento",
  "No Disponible": "No Disponible",
};
export const vehiclesService = {
  async getTipos(): Promise<TipoMaquinaria[]> {
    const { data } = await http.get("/api/Tipos");

    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.data)) return data.data;

    return [];
  },
  async createVehicle(payload: VehicleCreate) {
    const apiPayload = {
        ...payload,
        disponible: DISP_MAP[payload.disponible] || "No Disponible",
    };
    const { data } = await http.post("/api/Vehiculos", apiPayload);
    return data;
  },
};
