import { computed, reactive } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { authRepo } from '@/shared/services/authRepo';
import { setUnauthorizedHandler } from '@/shared/api/client';
import type { Rol, Usuario } from '@/shared/types/domain';

const USER_KEY = 'bovweight.session.user';

interface SessionState {
  user: Usuario | null;
  initializing: boolean;
}

const state = reactive<SessionState>({
  user: null,
  initializing: true,
});

const loadStoredUser = async (): Promise<Usuario | null> => {
  try {
    const { value } = await Preferences.get({ key: USER_KEY });
    if (!value) return null;
    return JSON.parse(value) as Usuario;
  } catch {
    return null;
  }
};

const persistUser = async (user: Usuario | null) => {
  if (user) {
    await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
  } else {
    await Preferences.remove({ key: USER_KEY });
  }
};

// Handler de 401: limpia sesión y redirige a login. El router se importa
// perezoso para evitar dependencia circular con el guard de navegación.
setUnauthorizedHandler(() => {
  state.user = null;
  void persistUser(null);
  import('@/router').then(({ default: router }) => {
    if (router.currentRoute.value.name !== 'login') {
      router.replace('/login');
    }
  });
});

export const currentUser = computed(() => state.user);
export const isAuthenticated = computed(() => Boolean(state.user));
export const isSessionInitializing = computed(() => state.initializing);

/**
 * Revalida la sesión al arrancar la app: si hay token, pide /me y refresca
 * el usuario. Si el token expiró, el interceptor 401 limpia todo.
 */
export const initSession = async (): Promise<void> => {
  state.initializing = true;
  const stored = await loadStoredUser();
  state.user = stored;

  try {
    const me = await authRepo.me();
    state.user = me;
    await persistUser(me);
  } catch {
    // si no hay token o falla /me, el interceptor 401 ya limpió; si fue
    // otro error (red), conservamos el usuario en caché para no bloquear.
    if (stored) state.user = stored;
  } finally {
    state.initializing = false;
  }
};

export const login = async (email: string, password: string): Promise<Usuario> => {
  const { user } = await authRepo.login(email.trim().toLowerCase(), password);
  state.user = user;
  await persistUser(user);
  return user;
};

export const logout = async (): Promise<void> => {
  await authRepo.logout();
  state.user = null;
  await persistUser(null);
};

export const getDefaultRouteForRole = (_role: Rol) => {
  // Todos los roles aterrizan en el dashboard; el guard limita tabs/acciones.
  return '/app/inicio';
};
