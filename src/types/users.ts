// ===============================
// CREATE USER REQUEST
// ===============================
export interface CreateUserRequest {
  nombreUsuario: string;
  email: string;
  password: string;   // obligatorio solo en creación
  rolId: number;
  choferId?: number;
}

// ===============================
// UPDATE USER REQUEST
// ===============================
// ✔ Aquí password debe ser opcional para que no marque error TS
export interface UpdateUserRequest {
  nombreUsuario?: string;
  email?: string;
  password?: string;   // opcional (solo si el usuario cambia password)
  rolId?: number;
  choferId?: number;
}

// ===============================
// CREATE AND ASSIGN DRIVER
// ===============================
export interface CreateAndAssignDriverRequest {
  nombreUsuario: string;
  email: string;
  rolId: number;
  choferId: number;
}

// ===============================
// USER RESPONSE
// ===============================
export interface UserResponse {
  id: number;
  nombreUsuario: string;
  email: string;
  rolId: number;
  rolNombre: string;
  estado: number;
  choferId?: number;
  fechaCreacion: string;
  ultimoAcceso?: string;
}
