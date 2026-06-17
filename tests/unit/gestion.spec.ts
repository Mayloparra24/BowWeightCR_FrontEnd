import { describe, expect, test } from 'vitest';
import { bovinos, fincas } from '../../src/shared/data/mockData';
import { actualizarBovino, areteEnUsoPorOtro } from '../../src/shared/services/bovinoService';
import { actualizarFinca, crearFinca, eliminarFinca } from '../../src/shared/services/fincaService';

describe('bovinoService (RF4)', () => {
  test('actualiza nombre, raza, sexo y observaciones', () => {
    const bovino = bovinos.find((item) => item.id === 'bovino-chirriche');
    expect(bovino).toBeDefined();

    actualizarBovino('bovino-chirriche', {
      name: 'El Chirriche Editado',
      breed: 'Gyr',
      sex: 'Hembra',
      observations: 'Cambio de prueba',
    });

    expect(bovino?.name).toBe('El Chirriche Editado');
    expect(bovino?.breed).toBe('Gyr');
    expect(bovino?.observations).toBe('Cambio de prueba');
  });

  test('rechaza nombre demasiado corto', () => {
    expect(() =>
      actualizarBovino('bovino-chirriche', { name: 'X', breed: 'Gyr', sex: 'Macho', observations: '' }),
    ).toThrowError();
  });

  test('detecta arete usado por otro bovino', () => {
    expect(areteEnUsoPorOtro('188012340056790', 'bovino-chirriche')).toBe(true);
    expect(areteEnUsoPorOtro('000000000000000', 'bovino-chirriche')).toBe(false);
  });
});

describe('fincaService (RF8)', () => {
  test('crea una finca y la asocia a las fincas del ganadero', () => {
    const asignadas: string[] = [];
    const finca = crearFinca({ name: 'Finca Nueva', location: 'Nicoya' }, asignadas);

    expect(fincas.some((item) => item.id === finca.id)).toBe(true);
    expect(asignadas).toContain(finca.id);
  });

  test('edita el nombre de una finca existente', () => {
    const finca = crearFinca({ name: 'Temporal', location: 'Cañas' });
    actualizarFinca(finca.id, { name: 'Renombrada', location: 'Cañas' });

    expect(fincas.find((item) => item.id === finca.id)?.name).toBe('Renombrada');
  });

  test('no permite eliminar una finca con bovinos asociados', () => {
    // farm-esperanza tiene bovinos en el mock
    expect(() => eliminarFinca('farm-esperanza')).toThrowError();
  });

  test('elimina una finca vacia', () => {
    const finca = crearFinca({ name: 'Vacia', location: 'Tilarán' });
    eliminarFinca(finca.id);

    expect(fincas.some((item) => item.id === finca.id)).toBe(false);
  });
});
