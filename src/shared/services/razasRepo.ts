import apiClient from '@/shared/api/client';
import type { ApiEnvelope, RazaDTO } from '@/shared/api/types';
import { mapRaza } from '@/shared/api/mappers';
import type { Raza } from '@/shared/types/domain';
import { CACHE_KEYS, getList, setList } from '@/shared/services/catalogCache';

export const razasRepo = {
  async list(): Promise<Raza[]> {
    try {
      const { data } = await apiClient.get<ApiEnvelope<RazaDTO[]>>('/razas');
      const mapped = data.data.map(mapRaza);
      await setList(CACHE_KEYS.razas, mapped);
      return mapped;
    } catch {
      return getList<Raza>(CACHE_KEYS.razas);
    }
  },
};
