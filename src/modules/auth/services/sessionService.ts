import { computed, reactive } from 'vue';
import { usuariosDemo } from '@/shared/data/mockData';
import type { Rol, Usuario } from '@/shared/types/domain';

const STORAGE_KEY = 'bovweight.session';

interface SessionState {
  user: Usuario | null;
}

const loadStoredUser = (): Usuario | null => {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Usuario;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

  return user;
};

export const logout = () => {
  state.user = null;
  localStorage.removeItem(STORAGE_KEY);
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
