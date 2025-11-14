import { http } from "./http";
import type { User } from "../types/auth";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  CreateAndAssignDriverRequest,
  UserResponse,
} from "../types/users";

export const usersService = {
  async getUsers(): Promise<User[]> {
    const { data } = await http.get("/api/usuarios");
    return Array.isArray(data) ? data : data?.data || [];
  },

  async createUser(data: CreateUserRequest): Promise<UserResponse> {
    const { data: response } = await http.post("/api/usuarios", data);
    return response;
  },

  async getUserById(id: number): Promise<UserResponse> {
    const { data } = await http.get(`/api/usuarios/${id}`);
    return data;
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse> {
    const { data: response } = await http.put(`/api/usuarios/${id}`, data);
    return response;
  },

  async updateUserStatus(id: number, estado: number): Promise<void> {
    await http.patch(`/api/usuarios/${id}/estado`, { estado });
  },

  async checkUserExists(id: number): Promise<boolean> {
    try {
      await http.get(`/api/usuarios/${id}/existe`);
      return true;
    } catch {
      return false;
    }
  },

  async createAndAssignDriver(data: CreateAndAssignDriverRequest): Promise<UserResponse> {
    const { data: response } = await http.post("/api/usuarios/crear-y-asignar-chofer", data);
    return response;
  },
};
