import { http } from "./http";
import type { ChoferCreateInput } from "../validation/drivers";

export const choferesService = {
  async createChofer(payload: ChoferCreateInput) {
    const { data } = await http.post("/api/choferes", payload);
    return data;
  },

  async getChoferes(): Promise<any[]> {
    const { data } = await http.get("/api/choferes");
    return Array.isArray(data) ? data : data?.data || [];
  },
};
