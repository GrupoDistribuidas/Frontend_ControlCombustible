import { z } from "zod";

export const LoginRequestSchema = z.object({
  username: z.string().min(3, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const LoginResponseSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  user: z
    .object({
      id: z.number().optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.string().optional(),
    })
    .optional(),
});
export const ForgotPasswordRequestSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Ingresa tu usuario o correo")
    .refine(
      (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[a-zA-Z0-9._-]{3,}$/.test(v),
      "Ingresa un correo válido o un usuario válido"
    ),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
