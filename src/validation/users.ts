import { z } from "zod";

/* -------------------------------------------------------
   CREATE USER
   ------------------------------------------------------- */
export const createUserSchema = z.object({
  nombreUsuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres"),

  email: z.string().email("Debe ser un email válido"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/,
      "La contraseña debe contener mayúscula, minúscula, número y carácter especial"
    ),

  rolId: z
    .number()
    .int("El rol debe ser un número entero")
    .min(1, "Debe seleccionar un rol"),

  choferId: z.number().optional(),
});

/* -------------------------------------------------------
   UPDATE USER
   ------------------------------------------------------- */
export const updateUserSchema = z.object({
  nombreUsuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres")
    .optional(),

  email: z.string().email("Debe ser un email válido").optional(),

  rolId: z
    .number()
    .int("El rol debe ser un número entero")
    .min(1, "Debe seleccionar un rol")
    .optional(),

  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    })
    .refine((val) => !val || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(val), {
      message: "La contraseña debe contener mayúscula, minúscula, número y carácter especial",
    }),

  choferId: z.number().optional(),
});

/* -------------------------------------------------------
   CREATE + ASSIGN DRIVER
   ------------------------------------------------------- */
export const createAndAssignDriverSchema = z.object({
  nombreUsuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres"),

  email: z.string().email("Debe ser un email válido"),

  rolId: z
    .number()
    .int("El rol debe ser un número entero")
    .min(1, "Debe seleccionar un rol"),

  choferId: z
    .number()
    .int("El chofer debe ser un número entero")
    .min(1, "Debe seleccionar un chofer"),
});

/* -------------------------------------------------------
   TYPES
   ------------------------------------------------------- */
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateAndAssignDriverFormData = z.infer<typeof createAndAssignDriverSchema>;
