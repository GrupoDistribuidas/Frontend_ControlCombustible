import type { PuntoCreateInput, PuntoUpdateInput } from "../validation/puntos";
import { http } from "./http";

export const puntosService = {
  async createPunto(payload: PuntoCreateInput) {
    const { data } = await http.post("/api/puntos", payload);
    return data;
  },

  async getPuntos(): Promise<any[]> {
    const { data } = await http.get("/api/puntos");
    return data?.data || [];
  },

  async getAllPuntos(): Promise<any[]> {
    const { data } = await http.get("/api/puntos/all");
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getPuntoById(id: number): Promise<any> {
    const { data } = await http.get(`/api/puntos/${id}`);
    return data?.data || data;
  },

  async updatePunto(id: number, payload: Partial<PuntoUpdateInput>) {
    const { data } = await http.put(`/api/puntos/${id}`, payload);
    return data;
  },

  async updatePuntoEstado(id: number, estado: boolean) {
    const { data } = await http.patch(`/api/puntos/${id}/estado`, { estado });
    return data;
  },

  async deletePunto(id: number) {
    const { data } = await http.delete(`/api/puntos/${id}`);
    return data;
  },

  async searchPuntos(term: string): Promise<any[]> {
    const { data } = await http.get(`/api/puntos/search/${term}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },
};
