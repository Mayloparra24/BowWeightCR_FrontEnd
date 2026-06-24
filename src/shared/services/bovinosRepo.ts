import apiClient from '@/shared/api/client';
import { extractApiError } from '@/shared/api/errors';
import type { ApiEnvelope, BovinoDTO } from '@/shared/api/types';
import { mapBovino } from '@/shared/api/mappers';
import type { Bovino } from '@/shared/types/domain';
import { CACHE_KEYS, getList, setList } from '@/shared/services/catalogCache';

export interface BovinoInput {
  fincaId: string;
  razaId: string;
  earTag: string;
  name?: string;
  sex: 'Macho' | 'Hembra';
  birthDate?: string;
  notes?: string;
}

const toPayload = (input: BovinoInput) => ({
  finca_id: Number(input.fincaId),
  raza_id: Number(input.razaId),
  numero_arete: input.earTag,
  nombre_animal: input.name ?? null,
  sexo: input.sex === 'Macho' ? 'macho' : 'hembra',
  fecha_nacimiento: input.birthDate || null,
  notas: input.notes ?? null,
});

export interface UpdateBovinoInput {
  razaId?: string;
  name?: string;
  sex?: 'Macho' | 'Hembra';
  birthDate?: string;
  notes?: string;
}

const toUpdatePayload = (input: UpdateBovinoInput) => {
  const payload: Record<string, unknown> = {};
  if (input.razaId !== undefined) payload.raza_id = Number(input.razaId);
  if (input.name !== undefined) payload.nombre_animal = input.name;
  if (input.sex !== undefined) payload.sexo = input.sex === 'Macho' ? 'macho' : 'hembra';
  if (input.birthDate !== undefined) payload.fecha_nacimiento = input.birthDate || null;
  if (input.notes !== undefined) payload.notas = input.notes;
  return payload;
};

export const bovinosRepo = {
  async list(): Promise<Bovino[]> {
    try {
      const { data } = await apiClient.get<ApiEnvelope<BovinoDTO[]>>('/bovinos');
      const mapped = data.data.map(mapBovino);
      await setList(CACHE_KEYS.bovinos, mapped);
      return mapped;
    } catch {
      return getList<Bovino>(CACHE_KEYS.bovinos);
    }
  },

  async get(id: string): Promise<Bovino> {
    const { data } = await apiClient.get<ApiEnvelope<BovinoDTO>>(`/bovinos/${id}`);
    return mapBovino(data.data);
  },

  async create(input: BovinoInput): Promise<Bovino> {
    try {
      const { data } = await apiClient.post<ApiEnvelope<BovinoDTO>>('/bovinos', toPayload(input));
      return mapBovino(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async update(id: string, input: UpdateBovinoInput): Promise<Bovino> {
    try {
      const { data } = await apiClient.put<ApiEnvelope<BovinoDTO>>(`/bovinos/${id}`, toUpdatePayload(input));
      return mapBovino(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/bovinos/${id}`);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async inactivar(id: string, motivo: string): Promise<Bovino> {
    try {
      const { data } = await apiClient.patch<ApiEnvelope<BovinoDTO>>(`/bovinos/${id}/inactivar`, { motivo });
      return mapBovino(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async activar(id: string): Promise<Bovino> {
    try {
      const { data } = await apiClient.patch<ApiEnvelope<BovinoDTO>>(`/bovinos/${id}/activar`);
      return mapBovino(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },
};
