import { Preferences } from '@capacitor/preferences';

export const CACHE_KEYS = {
  bovinos: 'bovweight.cache.bovinos.v1',
  fincas: 'bovweight.cache.fincas.v1',
  razas: 'bovweight.cache.razas.v1',
} as const;

export async function setList<T>(key: string, list: T[]): Promise<void> {
  try {
    await Preferences.set({ key, value: JSON.stringify(list) });
  } catch {
    // Cache write failures are non-fatal; the app continues with live data.
  }
}

export async function getList<T>(key: string): Promise<T[]> {
  try {
    const { value } = await Preferences.get({ key });
    if (!value) return [];
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
