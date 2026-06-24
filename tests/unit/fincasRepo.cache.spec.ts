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
import { fincasRepo } from '@/shared/services/fincasRepo';
import { CACHE_KEYS } from '@/shared/services/catalogCache';
import type { Finca } from '@/shared/types/domain';

describe('fincasRepo.list() — cache-aside', () => {
  const mockFincaDTOs = [
    {
      id: 5,
      nombre_finca: 'Finca El Rincón',
      ubicacion: 'San Carlos',
      canton: 'San Carlos',
      provincia: 'Alajuela',
      esta_activa: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
  });

  test('T1: success — returns mapped data and writes cache', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockFincaDTOs, message: 'ok' },
    });

    const result = await fincasRepo.list();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('5');
    expect(result[0].name).toBe('Finca El Rincón');
    expect(result[0].activa).toBe(true);

    // Cache written with correct key
    expect(vi.mocked(Preferences.set)).toHaveBeenCalledWith({
      key: CACHE_KEYS.fincas,
      value: expect.stringContaining('Finca El Rincón'),
    });
  });

  test('T2: fail — api throws, returns cached data silently', async () => {
    const cachedFincas: Finca[] = [
      {
        id: '99',
        name: 'Cached Finca',
        location: 'Alajuela',
        activa: true,
      },
    ];
    vi.mocked(Preferences.get).mockResolvedValueOnce({
      value: JSON.stringify(cachedFincas),
    });
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await fincasRepo.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Cached Finca');
    expect(vi.mocked(Preferences.set)).not.toHaveBeenCalled();
  });

  test('T3: fail + no cache — returns [] silently', async () => {
    vi.mocked(Preferences.get).mockResolvedValueOnce({ value: null });
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await fincasRepo.list();
    expect(result).toEqual([]);
  });
});
