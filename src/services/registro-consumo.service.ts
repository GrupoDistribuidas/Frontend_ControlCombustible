import { http } from "./http";

export interface RegistroConsumoCreateInput {
  asignacionRutaId: number;
  fechaRegistro: string;
  combustibleEstimado: number;
  combustibleReal: number;
  motivo?: string;
  estadoId: number;
}

export interface RegistroConsumoUpdateInput {
  fechaRegistro: string;
  combustibleEstimado: number;
  combustibleReal: number;
  motivo?: string;
  estadoId?: number;
}

export const registroConsumoService = {
  async getRegistrosConsumo(): Promise<any[]> {
    const { data } = await http.get("/api/RegistroConsumo");
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getRegistroConsumoById(id: number): Promise<any> {
    const { data } = await http.get(`/api/RegistroConsumo/${id}`);
    return data?.data || data;
  },

  async createRegistroConsumo(payload: RegistroConsumoCreateInput) {
    const { data } = await http.post("/api/RegistroConsumo", payload);
    return data;
  },

  async updateRegistroConsumo(id: number, payload: RegistroConsumoUpdateInput) {
    const { data } = await http.put(`/api/RegistroConsumo/${id}`, payload);
    return data;
  },

  async getRegistrosByAsignacion(asignacionId: number): Promise<any[]> {
    const { data } = await http.get(
      `/api/RegistroConsumo/asignacion/${asignacionId}`
    );
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getRegistrosByEstado(estadoId: number): Promise<any[]> {
    const { data } = await http.get(`/api/RegistroConsumo/estado/${estadoId}`);
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async getRegistrosByFechaRango(
    fechaInicio: string,
    fechaFin: string
  ): Promise<any[]> {
    const { data } = await http.get(
      `/api/RegistroConsumo/fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
    return data?.data || (Array.isArray(data) ? data : []);
  },

  async cambiarEstadoRegistro(id: number, nuevoEstado: string) {
    const { data } = await http.patch(`/api/RegistroConsumo/${id}/estado`, {
      nuevoEstado,
    });
    return data;
  },
};
