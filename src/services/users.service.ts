import { http } from "./http";
import type { User } from "../types/auth";

export const usersService = {
  async getUsers(): Promise<User[]> {
    const { data } = await http.get("/api/usuarios");
    console.log("Usuarios recibidos:", data);
    return Array.isArray(data) ? data : data?.data || [];
  },
};
