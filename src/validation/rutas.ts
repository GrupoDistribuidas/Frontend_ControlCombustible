import { z } from "zod";

export const RutaCreateSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es requerido"),
    puntoInicioId: z.number().min(1, "El punto de inicio es requerido"),
    puntoFinId: z.number().min(1, "El punto final es requerido"),
    distancia: z.number().min(0.01, "La distancia debe ser mayor a 0"),
  })
  .refine((data) => data.puntoInicioId !== data.puntoFinId, {
    message: "El punto de inicio y final deben ser diferentes",
    path: ["puntoFinId"],
  });

export const RutaUpdateSchema = z
  .object({
    nombre: z.string().min(1, "El nombre es requerido"),
    puntoInicioId: z.number().min(1, "El punto de inicio es requerido"),
    puntoFinId: z.number().min(1, "El punto final es requerido"),
    distancia: z.number().min(0.01, "La distancia debe ser mayor a 0"),
  })
  .refine((data) => data.puntoInicioId !== data.puntoFinId, {
    message: "El punto de inicio y final deben ser diferentes",
    path: ["puntoFinId"],
  });

export type RutaCreateInput = z.infer<typeof RutaCreateSchema>;
export type RutaUpdateInput = z.infer<typeof RutaUpdateSchema>;
