# TODO: Implementación CRUD de Rutas

## Información Recopilada

- DTOs del backend: RutaDto (id, nombre, puntoInicioId, puntoFinId, distancia, estado), CrearRutaDto (nombre, puntoInicioId, puntoFinId, distancia), ActualizarRutaDto (id, nombre, puntoInicioId, puntoFinId, distancia, estado?), PuntoDto (id, nombre, direccion, provincia, tipoPunto).
- Endpoints disponibles: GET /api/rutas, GET /api/rutas/all, GET /api/rutas/{id}, POST /api/rutas, PUT /api/rutas/{id}, PATCH /api/rutas/{id}/estado, GET /api/rutas/search/{term}, GET /api/puntos.
- Estructura frontend existente: React + TypeScript + Tailwind + Lucide + axios + react-hook-form + zod + react-hot-toast.
- Estilo coherente con páginas existentes como Choferes.

## Plan de Implementación

1. Crear tipos TypeScript en `src/types/rutas.ts` basados en DTOs.
2. Crear esquemas de validación en `src/validation/rutas.ts` con Zod.
3. Crear servicio en `src/services/rutas.service.ts` para llamadas a API.
4. Crear servicio para puntos en `src/services/puntos.service.ts` si no existe.
5. Crear componente modal `src/components/RutaModal.tsx` para crear/editar rutas.
6. Crear página principal `src/pages/Rutas.tsx` con tabla, filtros, búsqueda y acciones.
7. Agregar ruta en `src/routes/router.tsx` si es necesario.
8. Verificar integración y estilos coherentes.

## Pasos Detallados

- [x] Crear `src/types/rutas.ts`
- [x] Crear `src/validation/rutas.ts`
- [x] Crear `src/services/rutas.service.ts`
- [x] Crear `src/services/puntos.service.ts` (si no existe)
- [x] Crear `src/components/RutaModal.tsx`
- [x] Crear `src/pages/Rutas.tsx`
- [x] Actualizar `src/routes/router.tsx` para incluir ruta de Rutas
- [x] Actualizar `src/components/HamburgerMenu.tsx` para incluir menú de Rutas
- [x] Probar funcionalidad completa

## Validaciones Requeridas

- Campos obligatorios: nombre, puntoInicioId, puntoFinId, distancia.
- Distancia > 0.
- PuntoInicio ≠ PuntoFin.

## Características a Implementar

- Tabla con columnas: Id, Nombre, PuntoInicio, PuntoFin, Distancia, Estado, Acciones.
- Botones: Editar, Eliminar/Desactivar, Activar.
- Modal/formulario para Crear y Editar.
- Selects dinámicos para puntos (inicio y fin).
- Búsqueda por nombre usando /api/rutas/search?term=.
- Diseño responsive y moderno, coherente con Choferes.

## Notas

- No modificar backend ni endpoints.
- Usar axios para peticiones.
- Manejo de estado con useState + useEffect.
- Iconos con Lucide-react.
- Estilos con TailwindCSS.
