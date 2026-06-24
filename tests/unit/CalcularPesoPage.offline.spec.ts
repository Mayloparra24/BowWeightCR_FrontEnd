import { describe, expect, test, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

// Hoisted mutable state for mocks
const mockOnlineState = vi.hoisted(() => ({ current: true }));
const mockFincasList = vi.hoisted(() => vi.fn());
const mockBovinosList = vi.hoisted(() => vi.fn());
const mockRazasList = vi.hoisted(() => vi.fn());
const mockOnOnline = vi.hoisted(() => vi.fn());
const ionicCallbacks = vi.hoisted(() => ({
  willEnter: null as ((cb: () => void) => void) | null,
  willLeave: null as ((cb: () => void) => void) | null,
}));

// Capacitor mocks
vi.mock('@capacitor/preferences', () => ({
  Preferences: { get: vi.fn().mockResolvedValue({ value: null }), set: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));
vi.mock('@capacitor/network', () => ({
  Network: { addListener: vi.fn(), getStatus: vi.fn().mockResolvedValue({ connected: true }) },
}));
vi.mock('@capacitor/filesystem', () => ({
  Directory: { Data: 'DATA' },
  Filesystem: { writeFile: vi.fn(), readFile: vi.fn() },
}));

vi.mock('@/shared/services/fincasRepo', () => ({ fincasRepo: { list: mockFincasList } }));
vi.mock('@/shared/services/bovinosRepo', () => ({ bovinosRepo: { list: mockBovinosList } }));
vi.mock('@/shared/services/razasRepo', () => ({ razasRepo: { list: mockRazasList } }));
vi.mock('@/shared/services/pesajesRepo', () => ({
  pesajesRepo: { estimar: vi.fn(), createManual: vi.fn(), corregir: vi.fn() },
}));
vi.mock('@/shared/utils/bovinoPhoto', () => ({ dataUrlToBlob: vi.fn() }));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Use ref-like object for isOnline so Vue template's unref() resolves .value
vi.mock('@/shared/services/offlineService', () => ({
  enqueueEstimacion: vi.fn(),
  isOnline: {
    __v_isRef: true,
    __v_isShallow: false,
    get value() { return mockOnlineState.current; },
    set value(v) { mockOnlineState.current = v; },
  },
  onOnline: mockOnOnline,
}));

// Ionic mock with render functions that pass through slot content
vi.mock('@ionic/vue', () => {
  const SlotPass = { props: {}, setup: (_p: any, { slots }: any) => () => slots.default?.() };
  const enterSpy = vi.fn((cb: () => void) => { ionicCallbacks.willEnter = cb; });
  const leaveSpy = vi.fn((cb: () => void) => { ionicCallbacks.willLeave = cb; });
  return {
    IonContent: SlotPass,
    IonIcon: SlotPass,
    IonPage: SlotPass,
    IonSpinner: SlotPass,
    onIonViewWillEnter: enterSpy,
    onIonViewWillLeave: leaveSpy,
    default: { install: vi.fn() },
    IonicVue: { install: vi.fn() },
  };
});

import CalcularPesoPage from '@/modules/pesajes/pages/CalcularPesoPage.vue';
import { onOnline } from '@/shared/services/offlineService';
import type { Bovino, Finca, Raza } from '@/shared/types/domain';
import { nextTick } from 'vue';

/** Helper to access <script setup> internal refs on the wrapper VM. */
function vm(wrapper: ReturnType<typeof mount>) {
  return wrapper.vm as unknown as Record<string, any>;
}

describe('CalcularPesoPage — offline behavior', () => {
  let willEnterCb: () => unknown;
  let willLeaveCb: () => unknown;
  let onlineSubCb: (() => void) | null;
  let unsubOnline: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnlineState.current = true;

    // Reset callbacks (they'll be set again when the component mounts)
    ionicCallbacks.willEnter = null;
    ionicCallbacks.willLeave = null;

    // Set up onOnline mock to capture the refresh callback
    onlineSubCb = null;
    unsubOnline = vi.fn();
    vi.mocked(onOnline).mockImplementation((cb: () => void) => {
      onlineSubCb = cb;
      return unsubOnline;
    });

    mockFincasList.mockResolvedValue([]);
    mockBovinosList.mockResolvedValue([]);
    mockRazasList.mockResolvedValue([]);
  });

  const mountPage = () => {
    const wrapper = mount(CalcularPesoPage, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' },
        },
      },
    });
    // Capture callbacks set during component instantiation (mount)
    willEnterCb = (ionicCallbacks.willEnter as unknown as () => unknown);
    willLeaveCb = (ionicCallbacks.willLeave as unknown as () => unknown);
    return wrapper;
  };

  test('smoke: component mounts and ionic callback captured', () => {
    mountPage();
    // After mount, ionicCallbacks should be set by onIonViewWillEnter
    expect(ionicCallbacks.willEnter).not.toBeNull();
  });

  describe('Banner visibility (T4, T5)', () => {
    test('T4: banner visible when offline and step is foto', async () => {
      mockOnlineState.current = false;
      const wrapper = mountPage();
      await nextTick();

      const banner = wrapper.find('.offline-banner');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('La foto quedará en espera');
    });

    test('T4: banner visible when offline and step is existe', async () => {
      mockOnlineState.current = false;
      const wrapper = mountPage();
      vm(wrapper).step = 'existe';
      await nextTick();

      const banner = wrapper.find('.offline-banner');
      expect(banner.exists()).toBe(true);
      expect(banner.text()).toContain('La foto quedará en espera');
    });

    test('T5: banner hidden when offline and step is exito', async () => {
      mockOnlineState.current = false;
      const wrapper = mountPage();
      vm(wrapper).step = 'exito';
      await nextTick();

      const banner = wrapper.find('.offline-banner');
      expect(banner.exists()).toBe(false);
    });

    test('banner hidden when online regardless of step', async () => {
      mockOnlineState.current = true;
      const wrapper = mountPage();
      vm(wrapper).step = 'foto';
      await nextTick();

      const banner = wrapper.find('.offline-banner');
      expect(banner.exists()).toBe(false);
    });

    test('banner hidden when offline in procesando step', async () => {
      mockOnlineState.current = false;
      const wrapper = mountPage();
      vm(wrapper).step = 'procesando';
      await nextTick();

      const banner = wrapper.find('.offline-banner');
      expect(banner.exists()).toBe(false);
    });

    test('banner hidden when offline in resultado step', async () => {
      mockOnlineState.current = false;
      const wrapper = mountPage();
      vm(wrapper).step = 'resultado';
      await nextTick();

      const banner = wrapper.find('.offline-banner');
      expect(banner.exists()).toBe(false);
    });
  });

  describe('Online re-fetch with selection preservation (T8, T9)', () => {
    const mockBovino: Bovino = {
      id: 'abc', farmId: '10', name: 'Lucero', earTag: '123456',
      breed: 'Brahma', breedId: '2', sex: 'Hembra', status: 'Activo',
      photoUrl: '', lastWeightKg: 420, lastWeightDate: '01/06/2026',
    };
    const mockFinca: Finca = {
      id: '10', name: 'Finca El Rincón', location: 'Alajuela', activa: true,
    };
    const mockRaza: Raza = {
      id: '2', nombre: 'Brahma', constantePeso: 3.5,
    };

    test('T8: selection preserved when bovino still present after refresh', async () => {
      mockBovinosList.mockResolvedValue([mockBovino]);
      mockFincasList.mockResolvedValue([mockFinca]);
      mockRazasList.mockResolvedValue([mockRaza]);

      const wrapper = mountPage();
      vm(wrapper).selectedBovinoId = 'abc';
      await nextTick();

      // Fire onIonViewWillEnter to subscribe to onOnline
      willEnterCb();
      await vi.waitFor(() => expect(onlineSubCb).not.toBeNull());

      // Fire onOnline — should trigger refreshLists
      onlineSubCb!();
      await vi.waitFor(() => expect(vm(wrapper).selectedBovinoId).toBe('abc'));
    });

    test('T9: selection cleared when bovino absent after refresh', async () => {
      mockBovinosList.mockResolvedValue([mockBovino]);
      mockFincasList.mockResolvedValue([mockFinca]);
      mockRazasList.mockResolvedValue([mockRaza]);

      const wrapper = mountPage();
      vm(wrapper).selectedBovinoId = 'abc';
      await nextTick();

      willEnterCb();
      await vi.waitFor(() => expect(onlineSubCb).not.toBeNull());

      mockBovinosList.mockResolvedValue([]);

      onlineSubCb!();
      await vi.waitFor(() => expect(vm(wrapper).selectedBovinoId).toBe(''));
    });

    test('selection cleared when finca absent', async () => {
      mockFincasList.mockResolvedValue([mockFinca]);
      mockBovinosList.mockResolvedValue([mockBovino]);
      mockRazasList.mockResolvedValue([mockRaza]);

      const wrapper = mountPage();
      vm(wrapper).nuevo.farmId = '10';
      vm(wrapper).nuevo.breedId = '2';
      await nextTick();

      willEnterCb();
      await vi.waitFor(() => expect(onlineSubCb).not.toBeNull());

      mockFincasList.mockResolvedValue([]);

      onlineSubCb!();
      await vi.waitFor(() => expect(vm(wrapper).nuevo.farmId).toBe(''));
    });

    test('selection cleared when raza absent', async () => {
      mockFincasList.mockResolvedValue([mockFinca]);
      mockBovinosList.mockResolvedValue([mockBovino]);
      mockRazasList.mockResolvedValue([mockRaza]);

      const wrapper = mountPage();
      vm(wrapper).nuevo.farmId = '10';
      vm(wrapper).nuevo.breedId = '2';
      await nextTick();

      willEnterCb();
      await vi.waitFor(() => expect(onlineSubCb).not.toBeNull());

      mockRazasList.mockResolvedValue([]);

      onlineSubCb!();
      await vi.waitFor(() => expect(vm(wrapper).nuevo.breedId).toBe(''));
    });

    test('bovinosDisponibles filters status === Activo for selection check', async () => {
      const inactiveBovino: Bovino = { ...mockBovino, status: 'Inactivo' };
      mockBovinosList.mockResolvedValue([inactiveBovino]);
      mockFincasList.mockResolvedValue([mockFinca]);
      mockRazasList.mockResolvedValue([mockRaza]);

      const wrapper = mountPage();
      vm(wrapper).selectedBovinoId = 'abc';
      await nextTick();

      willEnterCb();
      await vi.waitFor(() => expect(onlineSubCb).not.toBeNull());

      onlineSubCb!();
      await vi.waitFor(() => expect(vm(wrapper).selectedBovinoId).toBe(''));
    });
  });

  describe('Subscription lifecycle', () => {
    test('onOnline is subscribed during onIonViewWillEnter', async () => {
      mountPage();
      // willEnterCb fires the async callback. Wait briefly for it to complete.
      const result = willEnterCb();
      if (result instanceof Promise) await result;
      expect(vi.mocked(onOnline)).toHaveBeenCalled();
    });

    test('unsubscribe called during onIonViewWillLeave', async () => {
      mountPage();
      const result = willEnterCb();
      if (result instanceof Promise) await result;
      expect(unsubOnline).not.toHaveBeenCalled(); // not yet

      willLeaveCb();
      expect(unsubOnline).toHaveBeenCalled();
    });
  });
});
