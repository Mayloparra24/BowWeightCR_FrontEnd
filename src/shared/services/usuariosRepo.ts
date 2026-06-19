import apiClient from '@/shared/api/client';
import { extractApiError } from '@/shared/api/errors';
import type { ApiEnvelope, UsuarioDTO, PaginatedMeta } from '@/shared/api/types';
import { mapUsuario } from '@/shared/api/mappers';
import type { Rol, Usuario } from '@/shared/types/domain';

export interface UsuarioInput {
  fullName: string;
  email: string;
  password: string;
  role: Rol;
  activo?: boolean;
}

const rolToBackend = (role: Rol): 'administrador' | 'ganadero' | 'veterinario' | 'asistente' => {
  if (role === 'admin') return 'administrador';
  return role;
};

const toPayload = (input: UsuarioInput) => ({
  nombre_completo: input.fullName,
  correo_electronico: input.email,
  contrasena: input.password,
  rol: rolToBackend(input.role),
  esta_activo: input.activo ?? true,
});

export interface UpdateUsuarioInput {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Rol;
  activo?: boolean;
}

const toUpdatePayload = (input: UpdateUsuarioInput) => {
  const payload: Record<string, unknown> = {};
  if (input.fullName !== undefined) payload.nombre_completo = input.fullName;
  if (input.email !== undefined) payload.correo_electronico = input.email;
  if (input.password !== undefined) payload.contrasena = input.password;
  if (input.role !== undefined) payload.rol = rolToBackend(input.role);
  if (input.activo !== undefined) payload.esta_activo = input.activo;
  return payload;
};

export interface UsuariosPaginados {
  items: Usuario[];
  meta: PaginatedMeta;
}

export const usuariosRepo = {
  async list(perPage = 15, page = 1): Promise<UsuariosPaginados> {
    try {
      const { data } = await apiClient.get<ApiEnvelope<UsuarioDTO[]>>('/usuarios', {
        params: { per_page: perPage, page },
      });
      return { items: data.data.map(mapUsuario), meta: data.meta as PaginatedMeta };
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async get(id: string): Promise<Usuario> {
    try {
      const { data } = await apiClient.get<ApiEnvelope<UsuarioDTO>>(`/usuarios/${id}`);
      return mapUsuario(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async create(input: UsuarioInput): Promise<Usuario> {
    try {
      const { data } = await apiClient.post<ApiEnvelope<UsuarioDTO>>('/usuarios', toPayload(input));
      return mapUsuario(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async update(id: string, input: UpdateUsuarioInput): Promise<Usuario> {
    try {
      const { data } = await apiClient.put<ApiEnvelope<UsuarioDTO>>(`/usuarios/${id}`, toUpdatePayload(input));
      return mapUsuario(data.data);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/usuarios/${id}`);
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async disponiblesPorRol(rol: string): Promise<{ id: number; nombre_completo: string; correo_electronico: string }[]> {
    const { data } = await apiClient.get(`/usuarios-disponibles/${rol}`);
    return data.data;
  },
};
