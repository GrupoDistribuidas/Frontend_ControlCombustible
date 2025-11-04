import { http } from "./http";

export const puntosService = {
  async getPuntos(): Promise<any[]> {
    const { data } = await http.get("/api/puntos");
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getPuntoById(id: number): Promise<any> {
    const { data } = await http.get(`/api/puntos/${id}`);
    return data?.data || data;
  },

  async searchPuntos(term: string): Promise<any[]> {
    const { data } = await http.get(`/api/puntos/search/${term}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },
};
