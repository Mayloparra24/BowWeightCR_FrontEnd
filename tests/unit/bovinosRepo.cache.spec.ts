import { describe, expect, test, vi, beforeEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';

// Mocks for catalogCache dependencies
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

// Import AFTER mocks
import apiClient from '@/shared/api/client';
import { bovinosRepo } from '@/shared/services/bovinosRepo';
import { CACHE_KEYS } from '@/shared/services/catalogCache';
import type { Bovino } from '@/shared/types/domain';

describe('bovinosRepo.list() — cache-aside', () => {
  const mockBovinoDTOs = [
    {
      id: 1,
      finca_id: 10,
      nombre_animal: 'Lucero',
      numero_arete: '123456',
      sexo: 'hembra' as const,
      estado: 'activo',
      foto_url: '',
      ultimo_peso_kg: 420,
      ultimo_peso_fecha: '2026-06-01',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
  });

  test('T1: success — returns mapped data and writes cache', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockBovinoDTOs, message: 'ok' },
    });

    const result = await bovinosRepo.list();

    // Returns mapped Bovino[]
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Lucero');
    expect(result[0].status).toBe('Activo');

    // cache written
    expect(vi.mocked(Preferences.set)).toHaveBeenCalledWith({
      key: CACHE_KEYS.bovinos,
      value: expect.stringContaining('Lucero'),
    });
  });

  test('T2: fail — api throws, returns cached data silently', async () => {
    // First populate the cache
    const cachedBovinos: Bovino[] = [
      {
        id: '99',
        farmId: '10',
        name: 'CachedBovino',
        earTag: '999999',
        breed: 'Brahma',
        breedId: '2',
        sex: 'Macho',
        status: 'Activo',
        photoUrl: '',
        lastWeightKg: 300,
        lastWeightDate: '2026-06-01',
      },
    ];
    vi.mocked(Preferences.get).mockResolvedValueOnce({
      value: JSON.stringify(cachedBovinos),
    });

    // API rejects
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await bovinosRepo.list();

    // Cached data returned
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('CachedBovino');
    expect(result[0].id).toBe('99');

    // Silently returns — no thrown error
    // set is NOT called again
    expect(vi.mocked(Preferences.set)).not.toHaveBeenCalled();
  });

  test('T3: fail + no cache — returns [] silently', async () => {
    // No cache (Preferences.get returns null)
    vi.mocked(Preferences.get).mockResolvedValueOnce({ value: null });

    // API rejects
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await bovinosRepo.list();

    expect(result).toEqual([]);
    // No error thrown
  });
});
