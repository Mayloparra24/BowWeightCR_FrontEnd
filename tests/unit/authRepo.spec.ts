import { describe, expect, test, vi, beforeEach } from 'vitest';
import apiClient, { setToken, clearToken } from '@/shared/api/client';
import { authRepo } from '@/shared/services/authRepo';

vi.mock('@/shared/api/client', async () => {
  const actual = await vi.importActual<typeof import('@/shared/api/client')>('@/shared/api/client');
  return {
    ...actual,
    default: {
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

describe('authRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('login envía credenciales y guarda token', async () => {
    const mockedPost = vi.mocked(apiClient.post);
    mockedPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: {
          token: 'abc123',
          usuario: {
            id: 1,
            nombre_completo: 'Admin User',
            correo_electronico: 'admin@test.com',
            rol: 'administrador',
            esta_activo: true,
            debe_cambiar_contrasena: true,
          },
        },
      },
    });

    const result = await authRepo.login('admin@test.com', 'secret');

    expect(mockedPost).toHaveBeenCalledWith('/login', {
      correo_electronico: 'admin@test.com',
      contrasena: 'secret',
    });
    expect(result.user.email).toBe('admin@test.com');
    expect(result.user.role).toBe('admin');
    expect(result.user.mustChangePassword).toBe(true);
    await expect(setToken('abc123')).resolves.toBeUndefined();
    await clearToken();
  });

  test('changePassword llama endpoint y guarda nuevo token', async () => {
    const mockedPost = vi.mocked(apiClient.post);
    mockedPost.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: {
          token: 'new-token',
          usuario: {
            id: 1,
            nombre_completo: 'Admin User',
            correo_electronico: 'admin@test.com',
            rol: 'administrador',
            esta_activo: true,
            debe_cambiar_contrasena: false,
          },
        },
      },
    });

    const result = await authRepo.changePassword({
      currentPassword: 'old',
      newPassword: 'newpass123',
      newPasswordConfirmation: 'newpass123',
    });

    expect(mockedPost).toHaveBeenCalledWith('/cambiar-contrasena', {
      contrasena_actual: 'old',
      contrasena_nueva: 'newpass123',
      contrasena_nueva_confirmation: 'newpass123',
    });
    expect(result.user.mustChangePassword).toBe(false);
    await clearToken();
  });
});
