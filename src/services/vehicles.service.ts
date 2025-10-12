import { http } from "./http";

export interface Vehicle {
  id: number;
  nombre: string;
  placa: string;
  marca: string;
  modelo: string;
  tipoMaquinariaId: number;
  disponible: string;
  consumoCombustibleKm: number;
  capacidadCombustible: number;
}

export const vehiclesService = {
  async getAll(): Promise<Vehicle[]> {
    const response = await http.get("/api/vehiculos");
    return response.data.data || [];
  },

  async search(filters: Record<string, any>): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value.toString());
      }
    });
    const response = await http.get(`/api/vehiculos/search?${params.toString()}`);
    return response.data.data || [];
  },

  async searchByTerm(term: string): Promise<Vehicle[]> {
    const response = await http.get(`/api/vehiculos/search/${encodeURIComponent(term)}`);
    return response.data.data || [];
  },
};
