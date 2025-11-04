import { z } from "zod";

export const PuntoCreateSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  provincia: z.string().min(1, "La provincia es requerida"),
  tipoPunto: z.string().min(1, "El tipo de punto es requerido"),
});

export const PuntoUpdateSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  direccion: z.string().min(1, "La dirección es requerida"),
  provincia: z.string().min(1, "La provincia es requerida"),
  tipoPunto: z.string().min(1, "El tipo de punto es requerido"),
});

export type PuntoCreateInput = z.infer<typeof PuntoCreateSchema>;
export type PuntoUpdateInput = z.infer<typeof PuntoUpdateSchema>;
