import { beforeEach, describe, expect, test } from 'vitest';
import {
  cancelarRecordatorio,
  listarRecordatorios,
  listarRecordatoriosVistos,
  marcarRecordatoriosVistos,
  obtenerRecordatorio,
  programarRecordatorio,
  solicitarPermisoNotificaciones,
} from '@/shared/services/reminderService';

// En el entorno de pruebas (web/jsdom) no hay plataforma nativa: el servicio
// debe funcionar sin lanzar y guardar la config en almacenamiento web.
describe('reminderService (web fallback)', () => {
  beforeEach(async () => {
    window.localStorage.clear();
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

  test('recordatorios vistos persisten en localStorage web', async () => {
    await marcarRecordatoriosVistos({ 'bovino-z': 'sin-fecha:0' });

    expect(window.localStorage.getItem('bovweight.recordatorios.vistos')).toContain('bovino-z');
    await expect(listarRecordatoriosVistos()).resolves.toEqual({ 'bovino-z': 'sin-fecha:0' });
  });
});
