import { http } from "./http";
import type { RutaCreateInput, RutaUpdateInput } from "../validation/rutas";

export const rutasService = {
  async createRuta(payload: RutaCreateInput) {
    const { data } = await http.post("/api/rutas", payload);
    return data;
  },

  async getRutas(): Promise<any[]> {
    const { data } = await http.get("/api/rutas");
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getAllRutas(): Promise<any[]> {
    const { data } = await http.get("/api/rutas/all");
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getRutaById(id: number): Promise<any> {
    const { data } = await http.get(`/api/rutas/${id}`);
    return data?.data || data;
  },

  async updateRuta(id: number, payload: Partial<RutaUpdateInput>) {
    const { data } = await http.put(`/api/rutas/${id}`, payload);
    return data;
  },

  async updateRutaEstado(id: number, estado: boolean) {
    const { data } = await http.patch(`/api/rutas/${id}/estado`, { estado });
    return data;
  },

  async searchRutas(term: string): Promise<any[]> {
    const { data } = await http.get(`/api/rutas/search/${term}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },
};
