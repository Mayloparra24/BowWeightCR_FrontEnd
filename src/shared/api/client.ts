import axios, { AxiosError, type AxiosInstance } from 'axios';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'auth_token';

let unauthorizedHandler: (() => void) | null = null;

/** Registra el callback que se ejecuta cuando una petición recibe 401. */
export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export const getToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: TOKEN_KEY });
  return value;
};

export const setToken = async (token: string) => {
  await Preferences.set({ key: TOKEN_KEY, value: token });
};

export const clearToken = async () => {
  await Preferences.remove({ key: TOKEN_KEY });
};

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
