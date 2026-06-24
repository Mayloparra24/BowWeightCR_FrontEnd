import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { pesajesRepo } from '@/shared/services/pesajesRepo';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => true,
  },
}));

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@capacitor/network', () => ({
  Network: {
    addListener: vi.fn(),
    getStatus: vi.fn().mockResolvedValue({ connected: true }),
  },
}));

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Data: 'DATA' },
  Filesystem: {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

vi.mock('@/shared/services/pesajesRepo', () => ({
  pesajesRepo: {
    estimar: vi.fn(),
    createManual: vi.fn(),
  },
}));

describe('offlineService - fotografias nativas', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
    vi.mocked(Filesystem.writeFile).mockResolvedValue({ uri: 'file:///foto.jpg' });
    vi.mocked(Filesystem.deleteFile).mockResolvedValue(undefined);

    const { markOfflineQueueSynced } = await import('@/shared/services/offlineService');
    await markOfflineQueueSynced();
  });

  test('crea directorios, lee la ruta relativa, envia y elimina la foto', async () => {
    vi.mocked(Filesystem.readFile).mockResolvedValue({ data: 'SGVsbG8=' });
    vi.mocked(pesajesRepo.estimar).mockResolvedValue({
      status: 'ok',
      pesaje: {
        id: 'p1',
        bovinoId: 'b1',
        date: '24/06/2026',
        weightKg: 420,
        source: 'IA',
      },
    });

    const { enqueueEstimacion, sincronizar } = await import('@/shared/services/offlineService');
    const item = await enqueueEstimacion({
      bovinoId: 'b1',
      razaId: 'r1',
      bovinoNombre: 'Lucero',
      fotoDataUrl: 'data:image/jpeg;base64,SGVsbG8=',
    });

    expect(Filesystem.writeFile).toHaveBeenCalledWith(expect.objectContaining({
      path: expect.stringMatching(/^bovweight_photos\/foto-\d+\.jpg$/),
      directory: Directory.Data,
      recursive: true,
    }));
    expect(item.fotoPath).toMatch(/^bovweight_photos\/foto-\d+\.jpg$/);
    expect(item.fotoBase64).toBeUndefined();

    await sincronizar();

    expect(Filesystem.readFile).toHaveBeenCalledWith({
      path: item.fotoPath,
      directory: Directory.Data,
    });
    expect(pesajesRepo.estimar).toHaveBeenCalledWith(expect.objectContaining({
      bovinoId: 'b1',
      razaId: 'r1',
      foto: expect.any(Blob),
      modoOffline: false,
    }));
    expect(Filesystem.deleteFile).toHaveBeenCalledWith({
      path: item.fotoPath,
      directory: Directory.Data,
    });
  });

  test('conserva base64 si falla el filesystem nativo', async () => {
    vi.mocked(Filesystem.writeFile).mockRejectedValueOnce(new Error('No se pudo escribir'));

    const { enqueueEstimacion } = await import('@/shared/services/offlineService');
    const item = await enqueueEstimacion({
      bovinoId: 'b1',
      razaId: 'r1',
      bovinoNombre: 'Lucero',
      fotoDataUrl: 'data:image/jpeg;base64,SGVsbG8=',
    });

    expect(item.fotoPath).toBeUndefined();
    expect(item.fotoBase64).toBe('data:image/jpeg;base64,SGVsbG8=');
  });
});
