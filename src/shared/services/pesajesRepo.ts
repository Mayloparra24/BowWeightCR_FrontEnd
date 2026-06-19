import apiClient from '@/shared/api/client';
import { extractApiError } from '@/shared/api/errors';
import type { ApiEnvelope, PesajeDTO, EstimacionOfflineDTO, PaginatedMeta } from '@/shared/api/types';
import { mapPesaje } from '@/shared/api/mappers';
import type { RegistroPeso } from '@/shared/types/domain';

export const pesajesRepo = {
  async listByBovino(bovinoId: string): Promise<RegistroPeso[]> {
    const { data } = await apiClient.get<ApiEnvelope<PesajeDTO[]>>(`/bovinos/${bovinoId}/pesajes`);
    return data.data.map(mapPesaje);
  },

  async createManual(bovinoId: string, pesoKg: number, notas?: string): Promise<RegistroPeso> {
    try {
      const { data } = await apiClient.post<ApiEnvelope<PesajeDTO>>('/pesajes', {
        bovino_id: Number(bovinoId),
        peso_registrado: pesoKg,
        notas_correccion: notas ?? null,
      });
      return mapPesaje(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async corregir(pesajeId: string, pesoKg: number, notas?: string): Promise<RegistroPeso> {
    try {
      const { data } = await apiClient.put<ApiEnvelope<PesajeDTO>>(`/pesajes/${pesajeId}/corregir`, {
        peso_registrado: pesoKg,
        notas_correccion: notas ?? null,
      });
      return mapPesaje(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  /**
   * Estima peso por IA. Devuelve:
   * - { status: 'ok', pesaje } cuando el backend procesa sync (200).
   * - { status: 'pendiente', fotografiaId } cuando modo_offline y backend responde 202.
   */
  async estimar(input: {
    bovinoId: string;
    razaId: string;
    foto: Blob;
    modoOffline?: boolean;
  }): Promise<{ status: 'ok'; pesaje: RegistroPeso } | { status: 'pendiente'; fotografiaId: string }> {
    const formData = new FormData();
    formData.append('bovino_id', input.bovinoId);
    formData.append('raza_id', input.razaId);
    const fotoFile = new File([input.foto], 'foto.jpg', { type: input.foto.type || 'image/jpeg' });
    formData.append('foto', fotoFile);
    formData.append('modo_offline', input.modoOffline ? '1' : '0');

    try {
      const { data, status } = await apiClient.post<
        ApiEnvelope<PesajeDTO | EstimacionOfflineDTO>
      >('/pesajes/estimar', formData);

      if (status === 202) {
        const offline = data.data as EstimacionOfflineDTO;
        return { status: 'pendiente', fotografiaId: String(offline.fotografia_id) };
      }

      return { status: 'ok', pesaje: mapPesaje(data.data as PesajeDTO) };
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },
};

export type EstimacionResultado = Awaited<ReturnType<typeof pesajesRepo.estimar>>;
export type { PaginatedMeta };
