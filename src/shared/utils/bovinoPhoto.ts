/**
 * Helpers para mostrar la foto de un bovino de forma segura.
 *
 * Problema que resuelve: algunos bovinos pueden no tener foto, o tener una
 * URL invalida (por ejemplo un `blob:` viejo que ya no existe en la sesion
 * actual). En esos casos el <img> mostraria el texto `alt` roto. Con un
 * placeholder y un manejador de error, cualquier imagen que falle cae a una
 * silueta generica en lugar de verse rota.
 */

// Placeholder embebido (SVG en base64) — no depende de la red.
export const BOVINO_PLACEHOLDER =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#cfe0f5"/>
      <g fill="#5b8fc0">
        <path d="M30 46c-4-6-12-7-12-1 0 5 5 8 9 8zM90 46c4-6 12-7 12-1 0 5-5 8-9 8z"/>
        <path d="M60 38c-16 0-28 10-28 24 0 12 9 22 28 22s28-10 28-22c0-14-12-24-28-24zm-12 28a4 4 0 110-8 4 4 0 010 8zm24 0a4 4 0 110-8 4 4 0 010 8zm-12 12c-5 0-9-2-9-5h18c0 3-4 5-9 5z"/>
      </g>
    </svg>`,
  );

/**
 * Devuelve la URL de la foto o el placeholder si esta vacia/ausente.
 */
export const bovinoPhoto = (photoUrl?: string | null): string => {
  if (!photoUrl || photoUrl.trim() === '') {
    return BOVINO_PLACEHOLDER;
  }

  return photoUrl;
};

/**
 * Manejador `@error` para <img>: si la imagen no carga, la reemplaza por el
 * placeholder. Evita bucles comprobando que no sea ya el placeholder.
 */
export const onBovinoPhotoError = (event: Event): void => {
  const img = event.target as HTMLImageElement;

  if (img.src !== BOVINO_PLACEHOLDER) {
    img.src = BOVINO_PLACEHOLDER;
  }
};
