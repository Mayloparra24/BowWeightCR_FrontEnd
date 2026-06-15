import type { Bovino, Finca, RegistroPeso } from '@/shared/types/domain';

export interface ReporteBovino {
  bovino: Bovino;
  finca?: Finca;
  registros: RegistroPeso[];
}

const CSV_SEPARATOR = ';';

const escapeCsv = (value: string | number) => {
  const text = String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadTextFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
  ];

  return lines.join('\n');
};

export const exportBovinoCsv = (report: ReporteBovino) => {
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
  downloadTextFile(
    `historial-${normalizeFilename(report.bovino.name || report.bovino.earTag)}.csv`,
    csv,
    'text/csv;charset=utf-8',
  );
};

export const exportInventarioCsv = (bovinos: Bovino[], fincas: Finca[]) => {
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
  downloadTextFile('inventario-bovweight.csv', csv, 'text/csv;charset=utf-8');
};

export const printBovinoReport = (report: ReporteBovino) => {
  const title = `Reporte BovWeightCR - ${report.bovino.name}`;
  const recordsHtml = report.registros.length
    ? report.registros
        .map(
          (record) => `
            <tr>
              <td>${record.date}</td>
              <td>${record.weightKg} kg</td>
              <td>${record.source}</td>
            </tr>
          `,
        )
        .join('')
    : '<tr><td colspan="3">Sin registros de peso.</td></tr>';

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=720,height=900');

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #071832; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { margin: 4px 0; }
          .summary { margin: 20px 0; padding: 16px; border: 1px solid #d7e0ea; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { padding: 10px; border-bottom: 1px solid #d7e0ea; text-align: left; }
          th { background: #eef4fb; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generado desde BovWeightCR</p>
        <section class="summary">
          <p><strong>Arete:</strong> ${report.bovino.earTag}</p>
          <p><strong>Finca:</strong> ${report.finca?.name ?? 'Sin finca'}</p>
          <p><strong>Raza:</strong> ${report.bovino.breed}</p>
          <p><strong>Sexo:</strong> ${report.bovino.sex}</p>
          <p><strong>Peso actual:</strong> ${report.bovino.lastWeightKg} kg</p>
        </section>
        <table>
          <thead><tr><th>Fecha</th><th>Peso</th><th>Tipo</th></tr></thead>
          <tbody>${recordsHtml}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

export const shareBovinoReport = async (report: ReporteBovino) => {
  const text = buildReportText(report);

  if (navigator.share) {
    await navigator.share({
      title: `Reporte de ${report.bovino.name}`,
      text,
    });
    return;
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};
