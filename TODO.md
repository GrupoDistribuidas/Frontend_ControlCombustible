# TODO: Corregir error 500 al cambiar estado de asignaciones y mostrar estados en combos

## Tareas Pendientes
- [ ] Modificar `src/services/asignaciones.service.ts`: Cambiar `updateEstadoAsignacion` para recibir y enviar `estadoId` numérico en lugar de string.
- [ ] Modificar `src/pages/Asignaciones.tsx`: Agregar reverse map para convertir nombres a IDs, actualizar `handleChangeEstado`, cambiar select value a ID y options a mostrar todos los estados con IDs.
- [ ] Probar el cambio de estado a "Completa" para verificar que no haya error 500.
- [ ] Verificar que los combos muestren correctamente los estados: 1 Asignada, 2 En Proceso, 3 Completa, 4 Cancelada, 5 Pausada.
