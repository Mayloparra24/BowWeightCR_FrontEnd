import { computed, reactive } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { pesajesRepo } from '@/shared/services/pesajesRepo';
import { dataUrlToBlob } from '@/shared/utils/bovinoPhoto';

/**
 * Cola offline de pesajes pendientes de sincronizar.
 *
 * - Estimación IA: encola {tipo:'estimacion', bovinoId, razaId, fotoBase64}.
 *   Al sincronizar reenvía la foto a `/pesajes/estimar` con modo_offline=false.
 * - Pesaje manual: encola {tipo:'manual', bovinoId, pesoKg, notas}.
 *   Al sincronizar hace `POST /pesajes`.
 *
 * Las fotos grandes se guardan en Filesystem (Directory.Data) y en la cola
 * solo queda la referencia (`fotoPath`); los metadatos viven en Preferences.
 */

const QUEUE_KEY = 'bovweight.offline.queue';
const PHOTO_DIR = 'bovweight_photos';

export type PendingStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface OfflineQueueItem {
  id: string;
  type: 'estimacion' | 'manual';
  description: string;
  status: PendingStatus;
  intentos: number;
  createdAt: string;
  error?: string;
  // estimacion
  bovinoId?: string;
  razaId?: string;
  bovinoNombre?: string;
  fotoPath?: string;
  fotoBase64?: string;
  // manual
  pesoKg?: number;
  notas?: string;
}

interface OfflineState {
  online: boolean;
  queue: OfflineQueueItem[];
  sincronizando: boolean;
}

const isNative = () => Capacitor.isNativePlatform();

const getInitialOnline = () => {
  if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') return true;
  return navigator.onLine;
};

const readQueue = async (): Promise<OfflineQueueItem[]> => {
  try {
    const { value } = await Preferences.get({ key: QUEUE_KEY });
    return value ? (JSON.parse(value) as OfflineQueueItem[]) : [];
  } catch {
    return [];
  }
};

const persistQueue = async (queue: OfflineQueueItem[]) => {
  try {
    await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify(queue) });
  } catch {
    // ponytail: si Preferences falla, la cola queda solo en memoria
  }
};

const state = reactive<OfflineState>({
  online: getInitialOnline(),
  queue: [],
  sincronizando: false,
});

// Carga la cola persistida sin bloquear el módulo.
void readQueue().then((q) => {
  state.queue.push(...q);
});

// Pub/sub para eventos de red (additivo, queue behavior unchanged).
const onlineHandlers = new Set<() => void>();
const offlineHandlers = new Set<() => void>();

export const onOnline = (handler: () => void): (() => void) => {
  onlineHandlers.add(handler);
  return () => {
    onlineHandlers.delete(handler);
  };
};

export const onOffline = (handler: () => void): (() => void) => {
  offlineHandlers.add(handler);
  return () => {
    offlineHandlers.delete(handler);
  };
};

const invokeOnlineHandlers = () => {
  onlineHandlers.forEach((fn) => fn());
};

const invokeOfflineHandlers = () => {
  offlineHandlers.forEach((fn) => fn());
};

// Listeners de red: en nativo usa @capacitor/network, en web los eventos window.
const setupNetworkListeners = () => {
  if (isNative()) {
    Network.addListener('networkStatusChange', (status) => {
      state.online = status.connected;
      if (status.connected) {
        void sincronizar();
        invokeOnlineHandlers();
      } else {
        invokeOfflineHandlers();
      }
    });
    void Network.getStatus().then((s) => {
      state.online = s.connected;
    });
  } else if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      state.online = true;
      void sincronizar();
      invokeOnlineHandlers();
    });
    window.addEventListener('offline', () => {
      state.online = false;
      invokeOfflineHandlers();
    });
  }
};

void setupNetworkListeners();

export const isOnline = computed(() => state.online);
export const pendingOfflineItems = computed(() => state.queue);
export const pendingOfflineCount = computed(() => state.queue.length);
export const isSincronizando = computed(() => state.sincronizando);

const generarId = () => `offline-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const guardarFoto = async (dataUrl: string): Promise<string> => {
  if (!isNative()) return dataUrl; // web: guardamos base64 en la cola
  try {
    const base64 = dataUrl.split(',')[1] ?? dataUrl;
    const name = `foto-${Date.now()}.jpg`;
    const res = await Filesystem.writeFile({
      path: `${PHOTO_DIR}/${name}`,
      data: base64,
      directory: Directory.Data,
    });
    return res.uri;
  } catch {
    return dataUrl;
  }
};

const leerFoto = async (item: OfflineQueueItem): Promise<Blob> => {
  if (item.fotoBase64) return dataUrlToBlob(item.fotoBase64);
  if (item.fotoPath && isNative()) {
    const { data } = await Filesystem.readFile({ path: item.fotoPath });
    // data es base64 en nativo
    return dataUrlToBlob(`data:image/jpeg;base64,${data}`);
  }
  throw new Error('Foto no disponible.');
};

export const enqueueEstimacion = async (input: {
  bovinoId: string;
  razaId: string;
  bovinoNombre: string;
  fotoDataUrl: string;
}): Promise<OfflineQueueItem> => {
  const fotoPath = await guardarFoto(input.fotoDataUrl);
  const item: OfflineQueueItem = {
    id: generarId(),
    type: 'estimacion',
    description: `Estimación IA - ${input.bovinoNombre}`,
    status: 'pending',
    intentos: 0,
    createdAt: new Date().toISOString(),
    bovinoId: input.bovinoId,
    razaId: input.razaId,
    bovinoNombre: input.bovinoNombre,
    fotoPath,
    fotoBase64: isNative() ? undefined : input.fotoDataUrl,
  };
  state.queue.unshift(item);
  await persistQueue(state.queue);
  return item;
};

export const enqueuePesajeManual = async (input: {
  bovinoId: string;
  bovinoNombre: string;
  pesoKg: number;
  notas?: string;
}): Promise<OfflineQueueItem> => {
  const item: OfflineQueueItem = {
    id: generarId(),
    type: 'manual',
    description: `Pesaje manual - ${input.bovinoNombre} (${input.pesoKg} Kg)`,
    status: 'pending',
    intentos: 0,
    createdAt: new Date().toISOString(),
    bovinoId: input.bovinoId,
    bovinoNombre: input.bovinoNombre,
    pesoKg: input.pesoKg,
    notas: input.notas,
  };
  state.queue.unshift(item);
  await persistQueue(state.queue);
  return item;
};

const procesarItem = async (item: OfflineQueueItem): Promise<boolean> => {
  item.status = 'syncing';
  try {
    if (item.type === 'estimacion') {
      const foto = await leerFoto(item);
      await pesajesRepo.estimar({
        bovinoId: item.bovinoId!,
        razaId: item.razaId!,
        foto,
        modoOffline: false,
      });
    } else {
      await pesajesRepo.createManual(item.bovinoId!, item.pesoKg!, item.notas);
    }
    item.status = 'synced';
    return true;
  } catch (error) {
    item.intentos += 1;
    item.status = item.intentos >= 3 ? 'failed' : 'pending';
    item.error = error instanceof Error ? error.message : 'Error al sincronizar.';
    return false;
  }
};

/**
 * Sincroniza los items pendientes o fallidos. Elimina los sincronizados.
 * Devuelve cuántos se sincronizaron correctamente.
 */
export const sincronizar = async (): Promise<number> => {
  if (state.sincronizando || !state.online) return 0;
  const pendientes = state.queue.filter((item) => item.status === 'pending' || item.status === 'failed');
  if (!pendientes.length) return 0;

  state.sincronizando = true;
  let ok = 0;
  try {
    for (const item of pendientes) {
      const success = await procesarItem(item);
      if (success) ok += 1;
    }
    // limpiar sincronizados
    state.queue = state.queue.filter((item) => item.status !== 'synced');
    await persistQueue(state.queue);
  } finally {
    state.sincronizando = false;
  }
  return ok;
};

/** Compat: limpia la cola (usado por la UI antigua). */
export const markOfflineQueueSynced = async () => {
  state.queue = [];
  await persistQueue(state.queue);
};
