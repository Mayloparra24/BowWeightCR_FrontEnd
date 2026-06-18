import { describe, expect, test } from 'vitest';
import { mapUsuario, mapBovino, mapPesaje, formatFecha } from '@/shared/api/mappers';
import type { UsuarioDTO, BovinoDTO, PesajeDTO } from '@/shared/api/types';

describe('mappers', () => {
  test('mapUsuario convierte admin y flag de cambio de contraseña', () => {
    const dto: UsuarioDTO = {
      id: 7,
      nombre_completo: 'Ivan Chavarria',
      correo_electronico: 'ivan@test.com',
      rol: 'administrador',
      esta_activo: true,
      debe_cambiar_contrasena: true,
    };
    const user = mapUsuario(dto);
    expect(user.id).toBe('7');
    expect(user.role).toBe('admin');
    expect(user.status).toBe('activo');
    expect(user.mustChangePassword).toBe(true);
  });

  test('mapUsuario convierte rol de asistente', () => {
    const dto: UsuarioDTO = {
      id: 3,
      nombre_completo: 'Asistente',
      correo_electronico: 'asistente@test.com',
      rol: 'asistente',
      esta_activo: false,
    };
    const user = mapUsuario(dto);
    expect(user.role).toBe('asistente');
    expect(user.status).toBe('inactivo');
    expect(user.mustChangePassword).toBe(false);
  });

  test('mapBovino extrae último pesaje', () => {
    const dto: BovinoDTO = {
      id: 1,
      finca_id: 2,
      raza_id: 3,
      numero_arete: 'A001',
      nombre_animal: 'Lucero',
      sexo: 'hembra',
      estado: 'activo',
      pesajes: [
        {
          id: 10,
          bovino_id: 1,
          peso_final: 420,
          tipo_pesaje: 'manual',
          es_correccion_manual: false,
          registrado_el: '2026-06-10T10:00:00Z',
        } as PesajeDTO,
      ],
    };
    const bovino = mapBovino(dto);
    expect(bovino.name).toBe('Lucero');
    expect(bovino.sex).toBe('Hembra');
    expect(bovino.status).toBe('Activo');
    expect(bovino.lastWeightKg).toBe(420);
    expect(bovino.lastWeightDate).toBe('10/06/2026');
  });

  test('mapPesaje convierte tipo ia a IA', () => {
    const dto: PesajeDTO = {
      id: 5,
      bovino_id: 1,
      peso_final: 380,
      tipo_pesaje: 'ia',
      es_correccion_manual: true,
      registrado_el: '2026-06-15T12:00:00Z',
      peso_estimado: 375,
      confianza_ia: 0.94,
    };
    const pesaje = mapPesaje(dto);
    expect(pesaje.source).toBe('IA');
    expect(pesaje.weightKg).toBe(380);
    expect(pesaje.esCorreccion).toBe(true);
    expect(pesaje.confianzaIa).toBe(0.94);
  });

  test('formatFecha devuelve cadena vacía para null', () => {
    expect(formatFecha(null)).toBe('');
    expect(formatFecha(undefined)).toBe('');
  });
});
