import apiClient from '@/shared/api/client';
import { extractApiError } from '@/shared/api/errors';
import type { ApiEnvelope, RazaDTO } from '@/shared/api/types';
import { mapRaza } from '@/shared/api/mappers';
import type { Raza } from '@/shared/types/domain';

let cache: Raza[] | null = null;

export const razasRepo = {
  async list(force = false): Promise<Raza[]> {
    if (cache && !force) return cache;
    try {
      const { data } = await apiClient.get<ApiEnvelope<RazaDTO[]>>('/razas');
      cache = data.data.map(mapRaza);
      return cache;
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },
};
