import apiClient from '@/shared/api/client';
import { extractApiError } from '@/shared/api/errors';
import type { ApiEnvelope, LoginDataDTO, UsuarioDTO } from '@/shared/api/types';
import { mapUsuario } from '@/shared/api/mappers';
import { setToken, clearToken } from '@/shared/api/client';
import type { Usuario } from '@/shared/types/domain';

export const authRepo = {
  async login(email: string, password: string): Promise<{ user: Usuario; token: string }> {
    try {
      const { data } = await apiClient.post<ApiEnvelope<LoginDataDTO>>('/login', {
        correo_electronico: email,
        contrasena: password,
      });
      await setToken(data.data.token);
      return { user: mapUsuario(data.data.usuario), token: data.data.token };
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/logout');
    } catch {
      // incluso si falla, limpiamos token local
    } finally {
      await clearToken();
    }
  },

  async me(): Promise<Usuario> {
    const { data } = await apiClient.get<ApiEnvelope<UsuarioDTO>>('/me');
    return mapUsuario(data.data);
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
  }): Promise<{ user: Usuario; token: string }> {
    try {
      const { data } = await apiClient.post<ApiEnvelope<LoginDataDTO>>('/cambiar-contrasena', {
        contrasena_actual: input.currentPassword,
        contrasena_nueva: input.newPassword,
        contrasena_nueva_confirmation: input.newPasswordConfirmation,
      });
      await setToken(data.data.token);
      return { user: mapUsuario(data.data.usuario), token: data.data.token };
    } catch (error) {
      throw new Error(extractApiError(error));
    }
  },
};
