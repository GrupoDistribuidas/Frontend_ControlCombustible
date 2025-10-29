import { http } from "./http";
import { usersService } from "./users.service";
import type { ChoferCreateInput, ChoferUpdateInput } from "../validation/drivers";

export const choferesService = {
  async createChofer(payload: ChoferCreateInput) {
    const { data } = await http.post("/api/Choferes", payload);
    return data;
  },

  async getChoferes(): Promise<any[]> {
    const { data } = await http.get("/api/Choferes/all");
    const choferes = data?.data || (Array.isArray(data) ? data : []);

    // Obtener todos los usuarios para mapear
    let users: any[] = [];
    try {
      users = await usersService.getUsers();
    } catch (e) {
      console.error("Error al cargar usuarios para mapeo:", e);
    }

    // Crear mapa de usuarios por ID
    const usersMap = new Map<number, any>();
    users.forEach((user) => usersMap.set(user.id, user));

    // Asegurar que estado y disponible sean boolean (manejar 0/1 o true/false)
    // Incluir usuario completo si usuarioId > 0
    return choferes.map((chofer: any) => ({
      ...chofer,
      estado: chofer.estado === 1 || chofer.estado === true,
      disponible: chofer.disponible === 1 || chofer.disponible === true,
      usuario: chofer.usuarioId && chofer.usuarioId > 0 ? usersMap.get(chofer.usuarioId) : undefined,
    }));
  },

  async updateChofer(id: number, payload: Partial<ChoferUpdateInput>) {
    // El backend espera todos los campos, así que necesitamos obtener el chofer actual y mergear
    const currentChoferes = await this.getChoferes();
    const currentChofer = currentChoferes.find(c => c.id === id);

    if (!currentChofer) {
      throw new Error("Chofer no encontrado");
    }

    // Mergear los campos actualizables con los valores actuales
    const fullPayload = {
      primerNombre: payload.primerNombre ?? currentChofer.primerNombre,
      segundoNombre: payload.segundoNombre ?? currentChofer.segundoNombre,
      primerApellido: payload.primerApellido ?? currentChofer.primerApellido,
      segundoApellido: payload.segundoApellido ?? currentChofer.segundoApellido,
      identificacion: currentChofer.identificacion,
      fechaNacimiento: currentChofer.fechaNacimiento,
      disponible: currentChofer.disponible,
      usuarioId: currentChofer.usuarioId,
      tipoMaquinariaId: payload.tipoMaquinariaId ?? currentChofer.tipoMaquinariaId,
      estado: currentChofer.estado,
    };

    const { data } = await http.put(`/api/Choferes/${id}`, fullPayload);
    return data;
  },

  async updateChoferEstado(id: number, estado: boolean) {
    const { data } = await http.patch(`/api/Choferes/${id}/estado`, { estado });
    return data;
  },

  async updateChoferDisponibilidad(id: number, disponible: boolean) {
    const { data } = await http.patch(`/api/Choferes/${id}/disponibilidad`, { disponible });
    return data;
  },

  async asignarUsuario(id: number, usuarioId: number) {
    const { data } = await http.patch(`/api/Choferes/${id}/asignar-usuario`, { usuarioId });
    return data;
  },
};
