import { z } from "zod";

export const DisponibilidadEnum = z.enum([
  "Disponible",
  "En Mantenimiento",
  "No Disponible",
]);
export type Disponibilidad = z.infer<typeof DisponibilidadEnum>;

const DisponibilidadSchema = z
  .union([z.literal(""), DisponibilidadEnum])
  .refine((v) => v !== "", { message: "Selecciona una disponibilidad" })
  .transform((v) => v as Disponibilidad);

function toNumberOrUndef(v: unknown) {
  if (v === "" || v === null || v === undefined) return undefined;
  const n =
    typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isNaN(n) ? undefined : n;
}

const NumRequeridoPositivo = (msgVacio = "Este campo no puede estar vacío") =>
  z
    .preprocess(toNumberOrUndef, z.union([z.number(), z.undefined()]))
    .refine((v) => v !== undefined, { message: msgVacio }) // requerido
    .transform((v) => v as number)
    .refine((v) => v > 0, { message: "Debe ser mayor a 0" });

const IntRequeridoPositivo = (msg = "Selecciona un tipo válido") =>
  z
    .preprocess(toNumberOrUndef, z.union([z.number(), z.undefined()]))
    .refine((v) => v !== undefined, { message: msg })
    .transform((v) => Math.trunc(v as number))
    .refine((v) => v > 0, { message: msg });

export const VehicleCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío"),
  placa: z.string().trim().toUpperCase().min(1, "La placa no puede estar vacía").regex(/^[A-Z]{3}-\d{4}$/, "La placa debe tener el formato XXX-1234 (tres letras mayúsculas, guión, cuatro dígitos)"),
  marca: z.string().trim().min(1, "La marca no puede estar vacía"),
  modelo: z.string().trim().min(1, "El modelo no puede estar vacío"),

  tipoMaquinariaId: IntRequeridoPositivo("Selecciona una maquinaria"),

  disponible: DisponibilidadSchema,

  consumoCombustibleKm: NumRequeridoPositivo("Este campo no puede estar vacío"),
  capacidadCombustible: NumRequeridoPositivo("Este campo no puede estar vacío"),
});

export type VehicleCreate = z.infer<typeof VehicleCreateSchema>;
export type VehicleCreateInput = z.input<typeof VehicleCreateSchema>;
export type TipoMaquinaria = { id: number; nombre: string };
