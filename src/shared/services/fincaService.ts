import { bovinos, fincas } from '@/shared/data/mockData';
import type { Finca } from '@/shared/types/domain';

/**
 * Servicio de gestion de fincas (RF8 / CU-08).
 *
 * Permite crear, editar y eliminar fincas sobre los datos MOCK reactivos.
 * Cuando exista backend, se reemplaza por llamadas HTTP (/fincas).
 */

export interface FincaInput {
  name: string;
  location: string;
}

const generarId = () => `farm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const validar = (input: FincaInput) => {
  if (input.name.trim().length < 2) {
    throw new Error('El nombre de la finca debe tener al menos 2 caracteres.');
  }

  if (input.location.trim().length < 2) {
    throw new Error('La ubicación es obligatoria.');
  }
};

/** Cuenta los bovinos asociados a una finca. */
export const contarBovinosDeFinca = (farmId: string): number => {
  return bovinos.filter((bovino) => bovino.farmId === farmId).length;
};

export const crearFinca = (input: FincaInput, assignedFarmIds?: string[]): Finca => {
  validar(input);

  const finca: Finca = {
    id: generarId(),
    name: input.name.trim(),
    location: input.location.trim(),
    cattleCount: 0,
  };

  fincas.push(finca);

  // Para que el ganadero vea de inmediato la finca que acaba de crear, se
  // asocia a sus fincas asignadas (la lista se filtra por assignedFarmIds).
  if (assignedFarmIds && !assignedFarmIds.includes(finca.id)) {
    assignedFarmIds.push(finca.id);
  }

  return finca;
};

export const actualizarFinca = (fincaId: string, input: FincaInput): Finca => {
  validar(input);

  const finca = fincas.find((item) => item.id === fincaId);

  if (!finca) {
    throw new Error('La finca no existe.');
  }

  finca.name = input.name.trim();
  finca.location = input.location.trim();

  return finca;
};

/**
 * Elimina una finca. No permite eliminar si tiene bovinos asociados, para no
 * dejar animales huerfanos (regla de integridad del CU-08).
 */
export const eliminarFinca = (fincaId: string, assignedFarmIds?: string[]): void => {
  const asociados = contarBovinosDeFinca(fincaId);

  if (asociados > 0) {
    throw new Error(`No se puede eliminar: la finca tiene ${asociados} bovino(s) asociado(s).`);
  }

  const index = fincas.findIndex((item) => item.id === fincaId);

  if (index !== -1) {
    fincas.splice(index, 1);
  }

  if (assignedFarmIds) {
    const assignedIndex = assignedFarmIds.indexOf(fincaId);
    if (assignedIndex !== -1) {
      assignedFarmIds.splice(assignedIndex, 1);
    }
  }
};
