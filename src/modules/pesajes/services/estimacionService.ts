import { bovinos, registrosPeso } from '@/shared/data/mockData';
import type { Bovino, RegistroPeso } from '@/shared/types/domain';

/**
 * Servicio MOCK de estimacion de peso.
 *
 * Simula el flujo CU-05 (Tomar Foto para Estimacion de Peso) mientras no
 * exista el backend Laravel ni el microservicio de ML. Cuando se conecte el
 * backend, este archivo es el unico punto que debe reemplazarse por llamadas
 * HTTP reales (POST de la imagen al endpoint de estimaciones).
 */

export const razasDisponibles = [
  'Brahman',
  'Holstein',
  'Pardo Suizo',
  'Gyr',
  'Simmental',
  'Jersey',
  'Criollo',
] as const;

const PESO_BASE_POR_RAZA: Record<string, number> = {
  Brahman: 470,
  Holstein: 520,
  'Pardo Suizo': 480,
  Gyr: 430,
  Simmental: 540,
  Jersey: 380,
  Criollo: 400,
};

const TIEMPO_PROCESO_MS = 1600;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const variacion = (porcentaje: number) => 1 + (Math.random() * 2 - 1) * porcentaje;

export interface ResultadoEstimacion {
  weightKg: number;
  confidence: number;
}

/**
 * Estima el peso de un bovino existente a partir de su historial.
 * La foto no se analiza realmente: es una simulacion local.
 */
export const estimarPesoBovinoExistente = async (bovino: Bovino): Promise<ResultadoEstimacion> => {
  await delay(TIEMPO_PROCESO_MS);

  const base = bovino.lastWeightKg > 0 ? bovino.lastWeightKg : PESO_BASE_POR_RAZA[bovino.breed] ?? 430;
  const weightKg = Math.round(base * variacion(0.04) + Math.random() * 6);
  const confidence = Math.round((0.82 + Math.random() * 0.14) * 100) / 100;

  return { weightKg, confidence };
};

/**
 * Estima el peso de un bovino nuevo usando la raza como referencia.
 */
export const estimarPesoBovinoNuevo = async (breed: string): Promise<ResultadoEstimacion> => {
  await delay(TIEMPO_PROCESO_MS);

  const base = PESO_BASE_POR_RAZA[breed] ?? 430;
  const weightKg = Math.round(base * variacion(0.12));
  const confidence = Math.round((0.78 + Math.random() * 0.16) * 100) / 100;

  return { weightKg, confidence };
};

const formatearFecha = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
};

const generarId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const existeArete = (earTag: string) => {
  const normalized = earTag.trim();
  return bovinos.some((bovino) => bovino.earTag === normalized);
};

export interface NuevoBovinoInput {
  name: string;
  earTag: string;
  farmId: string;
  breed: string;
  sex: Bovino['sex'];
  status?: Bovino['status'];
  birthDate: string;
  notes: string;
  photoUrl: string;
}

/**
 * Registra un bovino nuevo en los datos mock (RNF: validar antes de guardar).
 * Lanza error si el arete ya existe (flujo alternativo de CU-01).
 */
export const registrarBovino = (input: NuevoBovinoInput): Bovino => {
  if (existeArete(input.earTag)) {
    throw new Error('El número de arete ya está registrado en el sistema.');
  }

  const bovino: Bovino = {
    id: generarId('bovino'),
    farmId: input.farmId,
    name: input.name.trim(),
    earTag: input.earTag.trim(),
    breed: input.breed,
    sex: input.sex,
    status: input.status ?? 'Activo',
    photoUrl: input.photoUrl,
    lastWeightKg: 0,
    lastWeightDate: '',
    observations: input.notes.trim(),
  };

  bovinos.push(bovino);
  return bovino;
};

/**
 * Guarda un pesaje estimado por IA y actualiza el ultimo peso del bovino.
 */
export const guardarPesaje = (bovino: Bovino, weightKg: number, source: RegistroPeso['source'] = 'IA'): RegistroPeso => {
  const registro: RegistroPeso = {
    id: generarId('weight'),
    bovinoId: bovino.id,
    date: formatearFecha(new Date()),
    weightKg,
    source,
  };

  registrosPeso.unshift(registro);

  const target = bovinos.find((item) => item.id === bovino.id);
  if (target) {
    target.lastWeightKg = weightKg;
    target.lastWeightDate = registro.date;
  }

  return registro;
};
