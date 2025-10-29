import { z } from "zod";

const ID_RE = /^\d{10}$/;
const isAdult = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const adult = new Date(
    now.getFullYear() - 18,
    now.getMonth(),
    now.getDate()
  );
  return d <= adult;
};

// Función para validar cédula ecuatoriana
const validarCedula = (cedula: string) => {
  if (cedula.length !== 10) return false;

  const digitos = cedula.split('').map(Number);
  const provincia = digitos[0] * 10 + digitos[1];

  // Verificar provincia (01-24)
  if (provincia < 1 || provincia > 24) return false;

  // Verificar tercer dígito (0-5 para personas naturales)
  if (digitos[2] < 0 || digitos[2] > 5) return false;

  // Algoritmo de validación
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = digitos[i] * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === digitos[9];
};

export const ChoferCreateSchema = z.object({
  primerNombre: z.string().min(1, "El primer nombre es obligatorio"),
  segundoNombre: z.string().optional().or(z.literal("")), // opcional
  primerApellido: z.string().min(1, "El primer apellido es obligatorio"),
  segundoApellido: z.string().optional().or(z.literal("")), // opcional
  identificacion: z.string()
    .regex(ID_RE, "La cédula debe tener exactamente 10 dígitos")
    .refine(validarCedula, "La cédula no es válida"),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD")
    .refine(isAdult, "Debes ser mayor de 18 años"),
  disponible: z.boolean(),
  usuarioId: z.union([z.number().int().min(0), z.string().transform(val => parseInt(val, 10))]),
  tipoMaquinariaId: z.union([z.number().int().min(1), z.string().transform(val => parseInt(val, 10))]),
});


export type ChoferCreateInput = z.infer<typeof ChoferCreateSchema>;
