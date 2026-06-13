import { computed, reactive } from 'vue';
import { usuariosDemo } from '@/shared/data/mockData';
import type { Rol, Usuario } from '@/shared/types/domain';

const STORAGE_KEY = 'bovweight.session';

interface SessionState {
  user: Usuario | null;
}

/**
 * Acceso seguro a localStorage. En algunos entornos (pruebas, webviews
 * restringidos, modo privado) `localStorage` puede no existir o lanzar al
 * usarse. Estas funciones evitan que la app o los tests se rompan.
 */
const safeStorageGet = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeStorageSet = (key: string, value: string): void => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* almacenamiento no disponible: la sesion solo vive en memoria */
  }
};

const safeStorageRemove = (key: string): void => {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    /* sin almacenamiento: nada que limpiar */
  }
};

const loadStoredUser = (): Usuario | null => {
  const stored = safeStorageGet(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Usuario;
  } catch {
    safeStorageRemove(STORAGE_KEY);
    return null;
  }
};

const state = reactive<SessionState>({
  user: loadStoredUser(),
});

export const currentUser = computed(() => state.user);
export const isAuthenticated = computed(() => Boolean(state.user));

export const login = async (emailOrUser: string, password: string): Promise<Usuario> => {
  const normalizedEmail = emailOrUser.trim().toLowerCase();
  const user = usuariosDemo.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

  if (!user || user.status !== 'activo' || password.length < 6) {
    throw new Error('Revise sus credenciales e intente nuevamente.');
  }

  state.user = user;
  safeStorageSet(STORAGE_KEY, JSON.stringify(user));

  return user;
};

export const logout = () => {
  state.user = null;
  safeStorageRemove(STORAGE_KEY);
};

export const getDefaultRouteForRole = (role: Rol) => {
  if (role === 'admin') {
    return '/app/inicio';
  }

  if (role === 'veterinario') {
    return '/app/inicio';
  }

  return '/app/inicio';
};
