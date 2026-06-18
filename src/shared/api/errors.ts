import type { AxiosError } from 'axios';
import type { ApiEnvelope } from '@/shared/api/types';

type ApiErrorMessages = {
  notFound?: string;
  fallback?: string;
};

/** Extrae un mensaje legible de un error de axios (validación 422, error backend, red). */
export const extractApiError = (error: unknown, messages: ApiErrorMessages = {}): string => {
  const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
  const response = axiosError?.response;

  if (response) {
    const envelope = response.data;
    if (envelope?.message) {
      const details = envelope.error?.details;
      if (details && typeof details === 'object') {
        const firstField = Object.values(details as Record<string, string[]>)[0];
        if (firstField?.[0]) return firstField[0];
      }
      return envelope.message;
    }
    if (response.status === 401) return 'Credenciales incorrectas.';
    if (response.status === 403) return 'No tiene permisos para esta acción.';
    if (response.status === 404) return messages.notFound ?? 'El recurso no existe.';
    if (response.status === 429) return 'Demasiadas peticiones. Espere un momento.';
    return messages.fallback ?? `Error ${response.status}`;
  }

  if (axiosError?.request) {
    return 'Sin respuesta del servidor. Verifique su conexión.';
  }

  return error instanceof Error ? error.message : 'Error inesperado.';
};
