import { describe, expect, test, vi, beforeEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import {
  enqueueEstimacion,
  enqueuePesajeManual,
  sincronizar,
  pendingOfflineCount,
  isOnline,
  markOfflineQueueSynced,
} from '@/shared/services/offlineService';
import { pesajesRepo } from '@/shared/services/pesajesRepo';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
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
  },
}));

vi.mock('@/shared/services/pesajesRepo', () => ({
  pesajesRepo: {
    estimar: vi.fn(),
    createManual: vi.fn(),
  },
}));

describe('offlineService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
    markOfflineQueueSynced();
  });

  test('isOnline inicializa en true en jsdom', () => {
    expect(isOnline.value).toBe(true);
  });

  test('enqueuePesajeManual agrega item y actualiza contador', async () => {
    const item = await enqueuePesajeManual({
      bovinoId: 'b1',
      bovinoNombre: 'Lucero',
      pesoKg: 420,
    });

    expect(item.type).toBe('manual');
    expect(item.pesoKg).toBe(420);
    expect(item.status).toBe('pending');
    expect(pendingOfflineCount.value).toBe(1);
  });

  test('enqueueEstimacion agrega item con foto en web', async () => {
    const item = await enqueueEstimacion({
      bovinoId: 'b1',
      razaId: 'r1',
      bovinoNombre: 'Lucero',
      fotoDataUrl: 'data:image/jpeg;base64,abc',
    });

    expect(item.type).toBe('estimacion');
    expect(item.fotoBase64).toBe('data:image/jpeg;base64,abc');
    expect(pendingOfflineCount.value).toBe(1);
  });

  test('sincronizar envía pesaje manual exitoso', async () => {
    await enqueuePesajeManual({
      bovinoId: 'b1',
      bovinoNombre: 'Lucero',
      pesoKg: 420,
    });
    vi.mocked(pesajesRepo.createManual).mockResolvedValueOnce({
      id: 'p1',
      bovinoId: 'b1',
      date: '15/06/2026',
      weightKg: 420,
      source: 'Manual',
    });

    const ok = await sincronizar();

    expect(ok).toBe(1);
    expect(pesajesRepo.createManual).toHaveBeenCalledWith('b1', 420, undefined);
    expect(pendingOfflineCount.value).toBe(0);
  });

  test('sincronizar marca failed tras 3 intentos', async () => {
    await enqueuePesajeManual({
      bovinoId: 'b1',
      bovinoNombre: 'Lucero',
      pesoKg: 420,
    });
    vi.mocked(pesajesRepo.createManual).mockRejectedValue(new Error('Red'));

    await sincronizar();
    await sincronizar();
    await sincronizar();

    expect(pendingOfflineCount.value).toBe(1);
  });
});
