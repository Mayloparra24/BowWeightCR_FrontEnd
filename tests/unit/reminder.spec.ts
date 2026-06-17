import { beforeEach, describe, expect, test } from 'vitest';
import {
  cancelarRecordatorio,
  listarRecordatorios,
  obtenerRecordatorio,
  programarRecordatorio,
  solicitarPermisoNotificaciones,
} from '@/shared/services/reminderService';

// En el entorno de pruebas (web/jsdom) no hay plataforma nativa: el servicio
// debe funcionar sin lanzar y guardar la config en memoria.
describe('reminderService (web fallback)', () => {
  beforeEach(async () => {
    const actuales = await listarRecordatorios();
    await Promise.all(actuales.map((item) => cancelarRecordatorio(item.bovinoId)));
  });

  test('solicitar permiso no lanza y devuelve false en web', async () => {
    await expect(solicitarPermisoNotificaciones()).resolves.toBe(false);
  });

  test('programar guarda la periodicidad y un proximo aviso futuro', async () => {
    const recordatorio = await programarRecordatorio('bovino-x', 'Lucero', 30);

    expect(recordatorio.cadaDias).toBe(30);
    expect(new Date(recordatorio.proximoAviso).getTime()).toBeGreaterThan(Date.now());

    const guardado = await obtenerRecordatorio('bovino-x');
    expect(guardado?.bovinoNombre).toBe('Lucero');
  });

  test('cancelar elimina el recordatorio', async () => {
    await programarRecordatorio('bovino-y', 'Sombra', 15);
    await cancelarRecordatorio('bovino-y');

    const guardado = await obtenerRecordatorio('bovino-y');
    expect(guardado).toBeNull();
  });
});
