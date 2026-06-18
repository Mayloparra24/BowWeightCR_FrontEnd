import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

/**
 * Servicio de recordatorios de pesaje (CU-10 / RF10).
 *
 * Permite al ganadero configurar cada cuantos dias quiere que la app le avise
 * para volver a pesar un bovino, y programa una NOTIFICACION LOCAL real del
 * dispositivo (funciona aunque la app este cerrada).
 *
 * - En movil (Capacitor) usa @capacitor/local-notifications y @capacitor/preferences.
 * - En web/escritorio no hay notificaciones nativas: la config se guarda en
 *   localStorage, con respaldo en memoria si el navegador no permite guardar.
 */

const STORAGE_KEY = 'bovweight.recordatorios';
const SEEN_STORAGE_KEY = 'bovweight.recordatorios.vistos';

export interface Recordatorio {
  bovinoId: string;
  bovinoNombre: string;
  /** Periodicidad en dias (ej. 30 = cada mes). */
  cadaDias: number;
  /** Fecha ISO del proximo aviso programado. */
  proximoAviso: string;
  /** ID numerico de la notificacion local (para poder cancelarla). */
  notificationId: number;
}

const isNative = () => Capacitor.isNativePlatform();

// Se recuerda dentro de la sesion si el permiso ya quedo concedido, para no
// volver a invocar el sistema de permisos en cada "Activar" (lo que provocaba
// un parpadeo en pantalla).
let permisoConcedido = false;

// Respaldo en memoria para web cuando localStorage no esta disponible.
let memoriaWeb: Record<string, Recordatorio> = {};
let vistosMemoriaWeb: Record<string, string> = {};

const leerWebStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const guardarWebStorage = <T>(key: string, data: T): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

/** Genera un id numerico estable a partir del id del bovino. */
const notificationIdFor = (bovinoId: string): number => {
  let hash = 0;
  for (let i = 0; i < bovinoId.length; i += 1) {
    hash = (hash * 31 + bovinoId.charCodeAt(i)) % 2147483647;
  }
  return hash || 1;
};

const leerTodos = async (): Promise<Record<string, Recordatorio>> => {
  if (!isNative()) {
    return leerWebStorage(STORAGE_KEY, memoriaWeb);
  }

  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value ? (JSON.parse(value) as Record<string, Recordatorio>) : {};
  } catch {
    return {};
  }
};

const guardarTodos = async (data: Record<string, Recordatorio>): Promise<void> => {
  if (!isNative()) {
    memoriaWeb = { ...data };
    guardarWebStorage(STORAGE_KEY, data);
    return;
  }

  try {
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(data) });
  } catch {
    /* sin almacenamiento: queda solo en esta sesion */
  }
};

const leerVistos = async (): Promise<Record<string, string>> => {
  if (!isNative()) {
    return leerWebStorage(SEEN_STORAGE_KEY, vistosMemoriaWeb);
  }

  try {
    const { value } = await Preferences.get({ key: SEEN_STORAGE_KEY });
    return value ? (JSON.parse(value) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

const guardarVistos = async (data: Record<string, string>): Promise<void> => {
  if (!isNative()) {
    vistosMemoriaWeb = { ...data };
    guardarWebStorage(SEEN_STORAGE_KEY, data);
    return;
  }

  try {
    await Preferences.set({ key: SEEN_STORAGE_KEY, value: JSON.stringify(data) });
  } catch {
    /* sin almacenamiento: queda solo en esta sesion */
  }
};

/**
 * Pide permiso para enviar notificaciones. Devuelve true si quedo concedido.
 * En web devuelve false (no hay notificaciones nativas) sin lanzar error.
 */
export const solicitarPermisoNotificaciones = async (): Promise<boolean> => {
  if (!isNative()) {
    return false;
  }

  if (permisoConcedido) {
    return true;
  }

  try {
    const estado = await LocalNotifications.checkPermissions();

    if (estado.display === 'granted') {
      permisoConcedido = true;
      return true;
    }

    const pedido = await LocalNotifications.requestPermissions();
    permisoConcedido = pedido.display === 'granted';
    return permisoConcedido;
  } catch {
    return false;
  }
};

export const listarRecordatorios = async (): Promise<Recordatorio[]> => {
  const todos = await leerTodos();
  return Object.values(todos).sort((a, b) => a.proximoAviso.localeCompare(b.proximoAviso));
};

export const obtenerRecordatorio = async (bovinoId: string): Promise<Recordatorio | null> => {
  const todos = await leerTodos();
  return todos[bovinoId] ?? null;
};

export const listarRecordatoriosVistos = async (): Promise<Record<string, string>> => {
  return leerVistos();
};

export const marcarRecordatoriosVistos = async (
  recordatorios: string[] | Record<string, string>,
): Promise<void> => {
  const entries = Array.isArray(recordatorios)
    ? recordatorios.map((id) => [id, new Date().toISOString()] as const)
    : Object.entries(recordatorios);

  if (!entries.length) return;

  const vistos = await leerVistos();
  entries.forEach(([id, estado]) => {
    vistos[id] = estado;
  });
  await guardarVistos(vistos);
};

/**
 * Programa (o reprograma) el recordatorio de un bovino y agenda la notificacion
 * local. `cadaDias` es la periodicidad elegida por el ganadero.
 */
export const programarRecordatorio = async (
  bovinoId: string,
  bovinoNombre: string,
  cadaDias: number,
): Promise<Recordatorio> => {
  const notificationId = notificationIdFor(bovinoId);
  const proximo = new Date();
  proximo.setDate(proximo.getDate() + cadaDias);
  proximo.setHours(8, 0, 0, 0); // aviso a las 8:00 a.m.

  const recordatorio: Recordatorio = {
    bovinoId,
    bovinoNombre,
    cadaDias,
    proximoAviso: proximo.toISOString(),
    notificationId,
  };

  const todos = await leerTodos();
  todos[bovinoId] = recordatorio;
  await guardarTodos(todos);

  if (isNative()) {
    try {
      // Cancelar uno previo con el mismo id, por si se reprograma.
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });

      // Se programa UNA notificacion en la fecha del proximo pesaje (sin
      // `every`/`count`, que provocarian avisos diarios). La siguiente se
      // reprograma cuando el ganadero registre el pesaje o reabra esta pantalla.
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: 'Recordatorio de pesaje',
            body: `Es momento de pesar a ${bovinoNombre}.`,
            schedule: {
              at: proximo,
              allowWhileIdle: true,
            },
          },
        ],
      });
    } catch {
      /* si falla el agendado, al menos queda guardada la config */
    }
  }

  return recordatorio;
};

/** Cancela el recordatorio de un bovino y su notificacion local. */
export const cancelarRecordatorio = async (bovinoId: string): Promise<void> => {
  const todos = await leerTodos();
  const existente = todos[bovinoId];

  if (!existente) {
    return;
  }

  delete todos[bovinoId];
  await guardarTodos(todos);

  if (isNative()) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: existente.notificationId }] });
    } catch {
      /* nada que cancelar */
    }
  }
};
