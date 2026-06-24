import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';

// Mutable flag so each test group can toggle native vs web
let mockIsNative = false;

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => mockIsNative,
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

describe('offlineService — onOnline / onOffline (web fallback path)', () => {
  beforeAll(() => {
    mockIsNative = false;
    vi.resetModules();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
    // Ensure Network.addListener returns a remove function
    (Network.addListener as any).mockResolvedValue({ remove: vi.fn() });
  });

  test('onOnline handler fires when window dispatches online event', async () => {
    const { onOnline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOnline(handler);
    window.dispatchEvent(new Event('online'));
    expect(handler).toHaveBeenCalledTimes(1);
    unsub();
  });

  test('onOffline handler fires when window dispatches offline event', async () => {
    const { onOffline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOffline(handler);
    window.dispatchEvent(new Event('offline'));
    expect(handler).toHaveBeenCalledTimes(1);
    unsub();
  });

  test('unsubscribe stops online handler from firing', async () => {
    const { onOnline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOnline(handler);
    unsub();
    window.dispatchEvent(new Event('online'));
    expect(handler).not.toHaveBeenCalled();
  });

  test('unsubscribe stops offline handler from firing', async () => {
    const { onOffline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOffline(handler);
    unsub();
    window.dispatchEvent(new Event('offline'));
    expect(handler).not.toHaveBeenCalled();
  });

  test('same handler subscribed twice fires only once (Set dedupes)', async () => {
    const { onOnline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub1 = onOnline(handler);
    const unsub2 = onOnline(handler);
    window.dispatchEvent(new Event('online'));
    expect(handler).toHaveBeenCalledTimes(1);
    unsub1();
    unsub2();
  });

  test('offline handler NOT invoked on window online', async () => {
    const { onOffline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOffline(handler);
    window.dispatchEvent(new Event('online'));
    expect(handler).not.toHaveBeenCalled();
    unsub();
  });

  test('online handler NOT invoked on window offline', async () => {
    const { onOnline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOnline(handler);
    window.dispatchEvent(new Event('offline'));
    expect(handler).not.toHaveBeenCalled();
    unsub();
  });

  test('isOnline ref toggles via window events', async () => {
    const { isOnline } = await import('@/shared/services/offlineService');
    window.dispatchEvent(new Event('offline'));
    expect(isOnline.value).toBe(false);
    window.dispatchEvent(new Event('online'));
    expect(isOnline.value).toBe(true);
  });
});

describe('offlineService — onOnline / onOffline (native path)', () => {
  let nativeListenerCb: ((status: { connected: boolean }) => void) | null = null;

  beforeEach(() => {
    // Switch to native mode and re-import
    mockIsNative = true;
    vi.resetModules();

    nativeListenerCb = null;
    (Network.addListener as any).mockImplementation(
      (_event: string, cb: (status: { connected: boolean }) => void) => {
        nativeListenerCb = cb;
        return { remove: vi.fn() };
      },
    );
  });

  afterEach(() => {
    nativeListenerCb = null;
  });

  test('T10: onOnline handler fires when networkStatusChange fires connected', async () => {
    const { onOnline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOnline(handler);

    nativeListenerCb?.({ connected: true });
    expect(handler).toHaveBeenCalledTimes(1);
    unsub();
  });

  test('T11: unsubscribe stops the handler from firing', async () => {
    const { onOnline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOnline(handler);
    unsub();

    nativeListenerCb?.({ connected: true });
    expect(handler).not.toHaveBeenCalled();
  });

  test('onOffline handler fires on networkStatusChange disconnected', async () => {
    const { onOffline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub = onOffline(handler);

    nativeListenerCb?.({ connected: false });
    expect(handler).toHaveBeenCalledTimes(1);
    unsub();
  });

  test('double-sub (same handler) dedupes via Set', async () => {
    const { onOnline } = await import('@/shared/services/offlineService');
    const handler = vi.fn();
    const unsub1 = onOnline(handler);
    const unsub2 = onOnline(handler);

    nativeListenerCb?.({ connected: true });
    expect(handler).toHaveBeenCalledTimes(1);
    unsub1();
    unsub2();
  });

  test('isOnline toggles false on native disconnected event', async () => {
    const { isOnline } = await import('@/shared/services/offlineService');
    nativeListenerCb?.({ connected: false });
    expect(isOnline.value).toBe(false);
  });
});
