export type Chofer = {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  identificacion: string;
  fechaNacimiento: string;
  disponible: boolean;
  usuarioId?: number;
  usuario?: {
    id: number;
    nombreUsuario: string;
    email?: string;
  };
  tipoMaquinariaId: number;
  tipoMaquinaria?: {
    id: number;
    nombre: string;
  };
  estado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
};
