import { computed, reactive } from 'vue';

const STORAGE_KEY = 'bovweight.offline.queue';

export interface OfflineQueueItem {
  id: string;
  type: 'pesaje';
  createdAt: string;
  description: string;
}

interface OfflineState {
  online: boolean;
  queue: OfflineQueueItem[];
}

const readQueue = (): OfflineQueueItem[] => {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as OfflineQueueItem[] : [];
  } catch {
    return [];
  }
};

const persistQueue = (queue: OfflineQueueItem[]) => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    /* la cola queda disponible solo en memoria */
  }
};

const getInitialOnline = () => {
  if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') {
    return true;
  }

  return navigator.onLine;
};

const state = reactive<OfflineState>({
  online: getInitialOnline(),
  queue: readQueue(),
});

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    state.online = true;
  });
  window.addEventListener('offline', () => {
    state.online = false;
  });
}

export const isOnline = computed(() => state.online);
export const pendingOfflineItems = computed(() => state.queue);
export const pendingOfflineCount = computed(() => state.queue.length);

export const enqueueOfflineItem = (item: Omit<OfflineQueueItem, 'id' | 'createdAt'>) => {
  const queued: OfflineQueueItem = {
    ...item,
    id: `offline-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };

  state.queue.unshift(queued);
  persistQueue(state.queue);

  return queued;
};

export const markOfflineQueueSynced = () => {
  state.queue.splice(0, state.queue.length);
  persistQueue(state.queue);
};
