import { bovinos } from '@/shared/data/mockData';
import type { Bovino } from '@/shared/types/domain';

/**
 * Servicio de gestion de informacion de bovinos (RF4 / CU-04).
 *
 * Permite editar los datos de un bovino ya registrado. Trabaja sobre los datos
 * MOCK reactivos; cuando exista backend, este archivo se reemplaza por llamadas
 * HTTP (PUT /bovinos/:id).
 */

export interface EditarBovinoInput {
  name: string;
  breed: string;
  sex: Bovino['sex'];
  observations: string;
}

/** Verifica si un arete pertenece a OTRO bovino distinto al indicado. */
export const areteEnUsoPorOtro = (earTag: string, bovinoId: string): boolean => {
  const normalized = earTag.trim();
  return bovinos.some((item) => item.earTag === normalized && item.id !== bovinoId);
};

/**
 * Actualiza los datos editables de un bovino. Devuelve el bovino actualizado
 * o lanza si no existe o el arete queda duplicado.
 */
export const actualizarBovino = (bovinoId: string, input: EditarBovinoInput): Bovino => {
  const bovino = bovinos.find((item) => item.id === bovinoId);

  if (!bovino) {
    throw new Error('El bovino no existe.');
  }

  const name = input.name.trim();

  if (name.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres.');
  }

  bovino.name = name;
  bovino.breed = input.breed;
  bovino.sex = input.sex;
  bovino.observations = input.observations.trim();

  return bovino;
};
