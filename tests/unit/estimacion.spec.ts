import { describe, expect, test } from 'vitest';
import { bovinos, registrosPeso } from '../../src/shared/data/mockData';
import {
  estimarPesoBovinoExistente,
  existeArete,
  guardarPesaje,
  registrarBovino,
} from '../../src/modules/pesajes/services/estimacionService';

describe('estimacionService', () => {
  test('detecta aretes ya registrados', () => {
    expect(existeArete('188012340056789')).toBe(true);
    expect(existeArete('999999999999999')).toBe(false);
  });

  test('no permite registrar un bovino con arete duplicado', () => {
    expect(() =>
      registrarBovino({
        name: 'Duplicado',
        earTag: '188012340056789',
        farmId: 'farm-esperanza',
        breed: 'Brahman',
        sex: 'Macho',
        birthDate: '2024-01-01',
        notes: '',
        photoUrl: '',
      }),
    ).toThrowError();
  });

  test('registra un bovino nuevo y guarda su primer pesaje IA', () => {
    const bovino = registrarBovino({
      name: 'Lucero',
      earTag: '188012340099999',
      farmId: 'farm-esperanza',
      breed: 'Gyr',
      sex: 'Hembra',
      birthDate: '2024-05-10',
      notes: 'Prueba unitaria',
      photoUrl: '',
    });

    expect(bovinos.some((item) => item.id === bovino.id)).toBe(true);

    const registro = guardarPesaje(bovino, 415);

    expect(registro.source).toBe('IA');
    expect(registrosPeso[0].id).toBe(registro.id);
    expect(bovinos.find((item) => item.id === bovino.id)?.lastWeightKg).toBe(415);
  });

  test('la estimacion de un bovino existente retorna un peso razonable', async () => {
    const bovino = bovinos.find((item) => item.id === 'bovino-chirriche');
    expect(bovino).toBeDefined();

    if (!bovino) {
      return;
    }

    const resultado = await estimarPesoBovinoExistente(bovino);

    expect(resultado.weightKg).toBeGreaterThan(300);
    expect(resultado.weightKg).toBeLessThan(700);
    expect(resultado.confidence).toBeGreaterThan(0.7);
  });
});
