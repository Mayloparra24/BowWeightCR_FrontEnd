import { describe, expect, test, vi, beforeEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Import AFTER mocks
import { CACHE_KEYS, setList, getList } from '@/shared/services/catalogCache';

describe('catalogCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
  });

  describe('CACHE_KEYS', () => {
    test('exports versioned keys matching the design contract', () => {
      expect(CACHE_KEYS).toEqual({
        bovinos: 'bovweight.cache.bovinos.v1',
        fincas: 'bovweight.cache.fincas.v1',
        razas: 'bovweight.cache.razas.v1',
      });
    });
  });

  describe('setList / getList roundtrip', () => {
    test('T1: setList writes JSON to Preferences; getList reads it back', async () => {
      const items = [
        { id: '1', name: 'Bovino A', status: 'Activo' },
        { id: '2', name: 'Bovino B', status: 'Activo' },
      ];

      await setList(CACHE_KEYS.bovinos, items);

      expect(vi.mocked(Preferences.set)).toHaveBeenCalledWith({
        key: CACHE_KEYS.bovinos,
        value: JSON.stringify(items),
      });

      // Simulate persisted data
      vi.mocked(Preferences.get).mockResolvedValueOnce({
        value: JSON.stringify(items),
      });

      const result = await getList<{ id: string; name: string; status: string }>(CACHE_KEYS.bovinos);
      expect(result).toEqual(items);
    });
  });

  describe('getList — missing or corrupt key', () => {
    test('T3-missing: returns [] when Preferences has no value for the key', async () => {
      vi.mocked(Preferences.get).mockResolvedValueOnce({ value: null });

      const result = await getList(CACHE_KEYS.bovinos);
      expect(result).toEqual([]);
    });

    test('corrupt JSON: returns [] when stored value is not valid JSON', async () => {
      vi.mocked(Preferences.get).mockResolvedValueOnce({ value: '{broken json' });

      const result = await getList(CACHE_KEYS.bovinos);
      expect(result).toEqual([]);
    });

    test('Preferences.get throws: returns [] gracefully', async () => {
      vi.mocked(Preferences.get).mockRejectedValueOnce(new Error('Storage error'));

      const result = await getList(CACHE_KEYS.bovinos);
      expect(result).toEqual([]);
    });
  });
});
