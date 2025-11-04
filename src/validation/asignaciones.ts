import { z } from "zod";

export const AsignacionCreateSchema = z.object({
  rutaId: z.number().min(1, "La ruta es requerida"),
  choferId: z.number().min(1, "El chofer es requerido"),
  vehiculoId: z.number().min(1, "El vehículo es requerido"),
  fechaAsignacion: z.string().optional(),
});

export const AsignacionUpdateSchema = z.object({
  rutaId: z.number().min(1, "La ruta es requerida"),
  choferId: z.number().min(1, "El chofer es requerido"),
  vehiculoId: z.number().min(1, "El vehículo es requerido"),
  fechaAsignacion: z.string().optional(),
});

export type AsignacionCreateInput = z.infer<typeof AsignacionCreateSchema>;
export type AsignacionUpdateInput = z.infer<typeof AsignacionUpdateSchema>;
