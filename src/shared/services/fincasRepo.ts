import apiClient from '@/shared/api/client';
import { extractApiError } from '@/shared/api/errors';
import type { ApiEnvelope, FincaDTO } from '@/shared/api/types';
import { mapFinca } from '@/shared/api/mappers';
import type { Finca } from '@/shared/types/domain';

export interface FincaInput {
  name: string;
  location?: string;
  canton?: string;
  provincia?: string;
  activa?: boolean;
}

const toPayload = (input: FincaInput) => {
  const payload: Record<string, unknown> = {
    nombre_finca: input.name,
  };
  if (input.location !== undefined) payload.ubicacion = input.location;
  if (input.canton !== undefined) payload.canton = input.canton;
  if (input.provincia !== undefined) payload.provincia = input.provincia;
  if (input.activa !== undefined) payload.esta_activa = input.activa;
  return payload;
};

export const fincasRepo = {
  async list(): Promise<Finca[]> {
    const { data } = await apiClient.get<ApiEnvelope<FincaDTO[]>>('/fincas');
    return data.data.map(mapFinca);
  },

  async get(id: string): Promise<Finca> {
    const { data } = await apiClient.get<ApiEnvelope<FincaDTO>>(`/fincas/${id}`);
    return mapFinca(data.data);
  },

  async create(input: FincaInput): Promise<Finca> {
    try {
      const { data } = await apiClient.post<ApiEnvelope<FincaDTO>>('/fincas', toPayload(input));
      return mapFinca(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async update(id: string, input: FincaInput): Promise<Finca> {
    try {
      const { data } = await apiClient.put<ApiEnvelope<FincaDTO>>(`/fincas/${id}`, toPayload(input));
      return mapFinca(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/fincas/${id}`);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },
};
