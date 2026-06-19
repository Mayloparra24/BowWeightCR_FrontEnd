import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import type { Bovino, Finca, RegistroPeso } from '@/shared/types/domain';

export interface ReporteBovino {
  bovino: Bovino;
  finca?: Finca;
  registros: RegistroPeso[];
}

const CSV_SEPARATOR = ';';
const AVISO_LEGAL = 'El peso mostrado es una estimacion y no sustituye el pesaje oficial en bascula.';

const isNative = () => Capacitor.isNativePlatform();

const escapeCsv = (value: string | number) => {
  const text = String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const normalizeFilename = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/* -------------------------------------------------------------------------- */
/* Entrega de archivos: nativo (Capacitor) vs web (navegador)                 */
/* -------------------------------------------------------------------------- */

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      // result viene como data:<mime>;base64,XXXX -> nos quedamos con XXXX
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Descarga (web) de un Blob usando un enlace temporal.
 */
const webDownloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * "Descargar": guarda el archivo en el dispositivo SIN abrir el menu de
 * compartir. En nativo lo escribe en Documentos y avisa con un toast; en web
 * dispara la descarga del navegador.
 */
const guardarArchivo = async (filename: string, blob: Blob): Promise<void> => {
  if (isNative()) {
    const base64 = await blobToBase64(blob);

    await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Documents,
    });

    await Toast.show({
      text: `Archivo guardado en Documentos: ${filename}`,
      duration: 'long',
    });

    return;
  }

  webDownloadBlob(filename, blob);
};

/**
 * "Compartir": abre la hoja de compartir del sistema con el archivo adjunto.
 * En web intenta Web Share con archivo y, si no se puede, descarga.
 */
const compartirArchivo = async (
  filename: string,
  blob: Blob,
  mimeType: string,
  shareTitle: string,
): Promise<void> => {
  if (isNative()) {
    const base64 = await blobToBase64(blob);

    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: shareTitle,
      text: shareTitle,
      url: written.uri,
      dialogTitle: shareTitle,
    });

    return;
  }

  if (navigator.canShare) {
    const file = new File([blob], filename, { type: mimeType });

    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: shareTitle, text: shareTitle, files: [file] });
        return;
      } catch {
        /* el usuario cancelo o fallo: caer a descarga */
      }
    }
  }

  webDownloadBlob(filename, blob);
};

/* -------------------------------------------------------------------------- */
/* Texto plano del reporte (fallback)                                         */
/* -------------------------------------------------------------------------- */

export const buildReportText = ({ bovino, finca, registros }: ReporteBovino) => {
  const latest = registros[0];
  const lines = [
    `Reporte BovWeightCR - ${bovino.name}`,
    `Arete: ${bovino.earTag}`,
    `Finca: ${finca?.name ?? 'Sin finca'}`,
    `Raza: ${bovino.breed}`,
    `Sexo: ${bovino.sex}`,
    `Peso actual: ${bovino.lastWeightKg || latest?.weightKg || 0} kg`,
    `Ultimo pesaje: ${bovino.lastWeightDate || latest?.date || 'Sin registro'}`,
    '',
    'Historial:',
    ...registros.map((record) => `${record.date} - ${record.weightKg} kg - ${record.source}`),
    '',
    AVISO_LEGAL,
  ];

  return lines.join('\n');
};

/* -------------------------------------------------------------------------- */
/* Generacion de PDF (jsPDF)                                                  */
/* -------------------------------------------------------------------------- */

const COLOR_PRIMARY: [number, number, number] = [5, 43, 102];
const COLOR_TEXT: [number, number, number] = [7, 24, 50];
const COLOR_MUTED: [number, number, number] = [86, 96, 113];

const pdfBovino = async (report: ReporteBovino): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 56;

  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Reporte BovWeightCR', marginX, y);

  y += 22;
  doc.setFontSize(14);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(report.bovino.name, marginX, y);

  y += 26;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_MUTED);

  const datos = [
    `Arete: ${report.bovino.earTag}`,
    `Finca: ${report.finca?.name ?? 'Sin finca'}`,
    `Raza: ${report.bovino.breed}`,
    `Sexo: ${report.bovino.sex}`,
    `Estado: ${report.bovino.status}`,
    `Peso actual: ${report.bovino.lastWeightKg || 0} kg`,
    `Ultimo pesaje: ${report.bovino.lastWeightDate || 'Sin registro'}`,
  ];

  datos.forEach((linea) => {
    doc.text(linea, marginX, y);
    y += 16;
  });

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_TEXT);
  doc.text('Historial de pesos', marginX, y);

  y += 18;
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(marginX, y - 12, 500, 20, 'F');
  doc.text('Fecha', marginX + 8, y + 2);
  doc.text('Peso', marginX + 180, y + 2);
  doc.text('Tipo', marginX + 320, y + 2);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_TEXT);

  if (!report.registros.length) {
    doc.text('Sin registros de peso.', marginX + 8, y);
    y += 16;
  } else {
    report.registros.forEach((record) => {
      if (y > 760) {
        doc.addPage();
        y = 56;
      }
      doc.text(record.date, marginX + 8, y);
      doc.text(`${record.weightKg} kg`, marginX + 180, y);
      doc.text(record.source, marginX + 320, y);
      y += 16;
    });
  }

  y += 20;
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(AVISO_LEGAL, marginX, y, { maxWidth: 500 });

  return doc.output('blob');
};

const pdfInventario = async (bovinos: Bovino[], fincas: Finca[], titulo: string): Promise<Blob> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 56;

  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Reporte de animales', marginX, y);

  y += 22;
  doc.setFontSize(12);
  doc.setTextColor(...COLOR_TEXT);
  doc.text(titulo, marginX, y);

  y += 26;
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(marginX, y - 12, 500, 20, 'F');
  doc.text('Bovino', marginX + 8, y + 2);
  doc.text('Finca', marginX + 200, y + 2);
  doc.text('Peso', marginX + 400, y + 2);

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_TEXT);

  bovinos.forEach((bovino) => {
    if (y > 760) {
      doc.addPage();
      y = 56;
    }
    const finca = fincas.find((item) => item.id === bovino.farmId)?.name ?? 'Sin finca';
    doc.text(bovino.name, marginX + 8, y);
    doc.text(finca, marginX + 200, y);
    doc.text(`${bovino.lastWeightKg || 0} kg`, marginX + 400, y);
    y += 16;
  });

  y += 20;
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_MUTED);
  doc.text(AVISO_LEGAL, marginX, y, { maxWidth: 500 });

  return doc.output('blob');
};

/* -------------------------------------------------------------------------- */
/* CSV                                                                        */
/* -------------------------------------------------------------------------- */

const csvBovino = (report: ReporteBovino): Blob => {
  const rows = [
    ['fecha', 'peso_kg', 'tipo', 'bovino', 'arete', 'finca'],
    ...report.registros.map((record) => [
      record.date,
      record.weightKg,
      record.source,
      report.bovino.name,
      report.bovino.earTag,
      report.finca?.name ?? '',
    ]),
  ];

  const csv = `sep=${CSV_SEPARATOR}\n${rows.map((row) => row.map(escapeCsv).join(CSV_SEPARATOR)).join('\n')}`;
  return new Blob([csv], { type: 'text/csv;charset=utf-8' });
};

const csvInventario = (bovinos: Bovino[], fincas: Finca[]): Blob => {
  const rows = [
    ['nombre', 'arete', 'finca', 'raza', 'sexo', 'estado', 'ultimo_peso_kg', 'ultimo_pesaje'],
    ...bovinos.map((bovino) => [
      bovino.name,
      bovino.earTag,
      fincas.find((finca) => finca.id === bovino.farmId)?.name ?? '',
      bovino.breed,
      bovino.sex,
      bovino.status,
      bovino.lastWeightKg,
      bovino.lastWeightDate,
    ]),
  ];

  const csv = `sep=${CSV_SEPARATOR}\n${rows.map((row) => row.map(escapeCsv).join(CSV_SEPARATOR)).join('\n')}`;
  return new Blob([csv], { type: 'text/csv;charset=utf-8' });
};

/* -------------------------------------------------------------------------- */
/* API publica usada por las vistas                                           */
/* -------------------------------------------------------------------------- */

const baseName = (report: ReporteBovino) => normalizeFilename(report.bovino.name || report.bovino.earTag);

/** Boton "descargar": exporta el historial del bovino como CSV (guarda). */
export const exportBovinoCsv = async (report: ReporteBovino) => {
  try {
    const filename = `historial-${baseName(report)}.csv`;
    await guardarArchivo(filename, csvBovino(report));
  } catch {
    await Toast.show({ text: 'No se pudo exportar el CSV.', duration: 'short' });
  }
};

/** Boton "documento": genera y guarda el reporte del bovino en PDF. */
export const printBovinoReport = async (report: ReporteBovino) => {
  try {
    const filename = `reporte-${baseName(report)}.pdf`;
    await guardarArchivo(filename, await pdfBovino(report));
  } catch {
    await Toast.show({ text: 'No se pudo generar el PDF.', duration: 'short' });
  }
};

/** Boton "compartir": comparte el PDF del bovino como archivo adjunto. */
export const shareBovinoReport = async (report: ReporteBovino) => {
  try {
    const filename = `reporte-${baseName(report)}.pdf`;
    await compartirArchivo(filename, await pdfBovino(report), 'application/pdf', `Reporte de ${report.bovino.name}`);
  } catch {
    await Toast.show({ text: 'No se pudo compartir el reporte.', duration: 'short' });
  }
};

/** Inventario (SharedReportPage): CSV (guarda). */
export const exportInventarioCsv = async (bovinos: Bovino[], fincas: Finca[]) => {
  try {
    await guardarArchivo('inventario-bovweight.csv', csvInventario(bovinos, fincas));
  } catch {
    await Toast.show({ text: 'No se pudo exportar el inventario.', duration: 'short' });
  }
};

/** Inventario (SharedReportPage): PDF (guarda). */
export const exportInventarioPdf = async (bovinos: Bovino[], fincas: Finca[], titulo: string) => {
  try {
    await guardarArchivo('inventario-bovweight.pdf', await pdfInventario(bovinos, fincas, titulo));
  } catch {
    await Toast.show({ text: 'No se pudo generar el PDF del inventario.', duration: 'short' });
  }
};

/** Inventario (SharedReportPage): compartir PDF como archivo. */
export const shareInventarioPdf = async (bovinos: Bovino[], fincas: Finca[], titulo: string) => {
  try {
    await compartirArchivo(
      'inventario-bovweight.pdf',
      await pdfInventario(bovinos, fincas, titulo),
      'application/pdf',
      'Reporte BovWeightCR',
    );
  } catch {
    await Toast.show({ text: 'No se pudo compartir el inventario.', duration: 'short' });
  }
};
