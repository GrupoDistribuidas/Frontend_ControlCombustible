import { http } from "./http";

export interface EstadoAsignacion {
  id: number;
  nombre: string;
  descripcion?: string;
}

export const estadosAsignacionService = {
  async getEstadosAsignacion(): Promise<EstadoAsignacion[]> {
    const { data } = await http.get("/api/EstadosAsignacion");
    return data?.data || (Array.isArray(data) ? data : []);
  },
};
