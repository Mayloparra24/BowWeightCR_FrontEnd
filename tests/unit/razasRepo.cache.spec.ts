import { describe, expect, test, vi, beforeEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

import apiClient from '@/shared/api/client';
import { razasRepo } from '@/shared/services/razasRepo';
import { CACHE_KEYS } from '@/shared/services/catalogCache';
import type { Raza } from '@/shared/types/domain';

describe('razasRepo.list() — cache-aside (replaces in-memory cache)', () => {
  const mockRazaDTOs = [
    {
      id: 3,
      nombre_raza: 'Brahma',
      constante_peso: 3.5,
      enfoque: 'Carne',
      descripcion: 'Raza Brahman',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
  });

  test('T1: success — returns mapped data and writes cache', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockRazaDTOs, message: 'ok' },
    });

    const result = await razasRepo.list();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
    expect(result[0].nombre).toBe('Brahma');

    // Cache written with correct key
    expect(vi.mocked(Preferences.set)).toHaveBeenCalledWith({
      key: CACHE_KEYS.razas,
      value: expect.stringContaining('Brahma'),
    });
  });

  test('T2: fail — api throws, returns cached data silently', async () => {
    const cachedRazas: Raza[] = [
      {
        id: '99',
        nombre: 'Cached Raza',
        constantePeso: 2.0,
      },
    ];
    vi.mocked(Preferences.get).mockResolvedValueOnce({
      value: JSON.stringify(cachedRazas),
    });
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await razasRepo.list();

    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Cached Raza');
    expect(vi.mocked(Preferences.set)).not.toHaveBeenCalled();
  });

  test('T3: fail + no cache — returns [] silently', async () => {
    vi.mocked(Preferences.get).mockResolvedValueOnce({ value: null });
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await razasRepo.list();
    expect(result).toEqual([]);
  });

  test('no in-memory cache variable or force param', () => {
    // The export should be a plain object with list() accepting no 'force' param
    expect(razasRepo.list.length).toBe(0); // 0 params (no 'force')
  });
});
