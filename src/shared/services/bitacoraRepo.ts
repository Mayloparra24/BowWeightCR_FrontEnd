import apiClient from '@/shared/api/client';
import { extractApiError } from '@/shared/api/errors';
import type { ApiEnvelope, BitacoraDTO, PaginatedMeta } from '@/shared/api/types';
import { mapBitacora } from '@/shared/api/mappers';
import type { BitacoraEvento } from '@/shared/types/domain';

export interface BitacoraFiltros {
  usuarioId?: string;
  accion?: string;
  entidadTipo?: string;
  desde?: string;
  hasta?: string;
  perPage?: number;
  page?: number;
}

export interface BitacoraPaginada {
  items: BitacoraEvento[];
  meta: PaginatedMeta;
}

export const bitacoraRepo = {
  async list(filtros: BitacoraFiltros = {}): Promise<BitacoraPaginada> {
    try {
      const params: Record<string, unknown> = {
        per_page: filtros.perPage ?? 15,
        page: filtros.page ?? 1,
      };
      if (filtros.usuarioId) params.usuario_id = filtros.usuarioId;
      if (filtros.accion) params.accion = filtros.accion;
      if (filtros.entidadTipo) params.entidad_tipo = filtros.entidadTipo;
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;

      const { data } = await apiClient.get<ApiEnvelope<BitacoraDTO[]>>('/bitacora', { params });
      return { items: data.data.map(mapBitacora), meta: data.meta as PaginatedMeta };
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },
};
