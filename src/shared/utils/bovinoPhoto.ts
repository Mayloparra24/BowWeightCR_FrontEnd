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

/* -------------------------------------------------------------------------- */
/* Compresión y conversión de imágenes (para subir al backend)                */
/* -------------------------------------------------------------------------- */

/**
 * Comprime una imagen (File/Blob/dataURL) a JPEG con un tamaño máximo de lado
 * y calidad dados. Devuelve un Blob listo para FormData. Reduce el peso de la
 * foto antes de subirla al endpoint de estimación (max 10 MB en backend).
 */
export const compressImage = async (
  source: File | Blob | string,
  maxDim = 1280,
  quality = 0.8,
): Promise<Blob> => {
  const bitmap = await loadImageBitmap(source);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return source instanceof Blob ? source : dataUrlToBlob(source);
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b ?? new Blob()), 'image/jpeg', quality);
  });
  return blob;
};

const loadImageBitmap = (source: File | Blob | string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof source === 'string' ? source : URL.createObjectURL(source);
    img.onload = () => {
      if (typeof source !== 'string') URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    img.src = url;
  });

/**
 * Convierte un data URL (base64) en Blob. Útil para la cola offline, donde la
 * foto se guarda como base64 en Preferences/Filesystem y hay que reenviarla.
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64 ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
};

