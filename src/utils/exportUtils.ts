import { GeneratedCRMSystem, WhatsAppTemplate } from '../types';

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    textArea.remove();
    return true;
  } catch (err) {
    console.error('Fallback copy failed', err);
    textArea.remove();
    return false;
  }
}

export function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const processCell = (cell: string) => {
    let formatted = cell ? cell.toString().replace(/"/g, '""') : '';
    if (formatted.search(/("|,|\n)/g) >= 0) {
      formatted = `"${formatted}"`;
    }
    return formatted;
  };

  const csvContent = [
    headers.map(processCell).join(','),
    ...rows.map((row) => row.map(processCell).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateCRMAsMarkdown(crm: GeneratedCRMSystem): string {
  let md = `# SISTEMA CRM GRATUITO: ${crm.businessSummary.name.toUpperCase()}\n`;
  md += `**Tipo de Negocio:** ${crm.businessSummary.typeLabel}\n`;
  md += `**Ubicación:** ${crm.businessSummary.location}\n`;
  md += `**Moneda:** ${crm.businessSummary.currency}\n\n`;
  md += `> **Recomendación:** ${crm.businessSummary.recommendation}\n\n`;
  md += `---\n\n`;

  md += `## 1. FICHA DE CLIENTE (ESTRUCTURA DE CAMPOS PARA GOOGLE SHEETS)\n\n`;
  md += `| Campo | Categoría | Tipo de Dato | Ejemplo | Para qué sirve |\n`;
  md += `|---|---|---|---|---|\n`;
  crm.fichaCliente.fields.forEach((f) => {
    md += `| ${f.name} | ${f.category} | ${f.type} | ${f.example} | ${f.purpose} |\n`;
  });
  md += `\n*Nota:* ${crm.fichaCliente.note}\n\n`;
  md += `---\n\n`;

  md += `## 2. PLANTILLAS DE WHATSAPP Y COMUNICACIÓN\n\n`;
  crm.plantillasMensajes.forEach((t, i) => {
    md += `### ${i + 1}. ${t.title}\n`;
    md += `*Cuándo enviar:* ${t.recommendedTiming}\n\n`;
    md += `\`\`\`text\n${t.templateText}\n\`\`\`\n\n`;
  });
  md += `---\n\n`;

  md += `## 3. MÓDULO DE CONTROL DE COLABORADORES & CIERRE DIARIO\n\n`;
  md += `**Esquema:** ${crm.moduloColaboradores.modelType}\n\n`;
  md += `### Columnas recomendadas para la pestaña "Cierre Diario":\n\n`;
  md += `| Columna | Descripción | Fórmula | Valor de Ejemplo |\n`;
  md += `|---|---|---|---|\n`;
  crm.moduloColaboradores.dailyClosingColumns.forEach((c) => {
    md += `| ${c.columnName} | ${c.description} | \`${c.formula || 'Manual'}\` | ${c.exampleValue} |\n`;
  });
  md += `\n### Reglas y Consejos de Pago:\n`;
  crm.moduloColaboradores.paymentRules.forEach((r) => {
    md += `- ${r}\n`;
  });
  md += `\n---\n\n`;

  md += `## 4. GUÍA GRATUITA PASO A PASO\n\n`;
  crm.guiaPasoAPaso.steps.forEach((s) => {
    md += `### Paso ${s.stepNumber}: ${s.title}\n`;
    md += `${s.description}\n\n`;
    md += `💡 **Tip de Implementación:** ${s.actionableTip}\n\n`;
  });

  md += `### Fórmulas Útiles de Google Sheets:\n\n`;
  crm.guiaPasoAPaso.googleSheetsFormulaHelpers.forEach((f) => {
    md += `- **${f.formulaName}:** \`${f.formulaCode}\` (${f.explanation})\n`;
  });

  return md;
}

export function fillTemplateVariables(
  template: string,
  data: {
    clientName?: string;
    businessName?: string;
    date?: string;
    time?: string;
    service?: string;
    specialist?: string;
    address?: string;
    whatsapp?: string;
  }
): string {
  let result = template;
  result = result.replace(/\[Nombre_Cliente\]/gi, data.clientName || 'Carlos Gómez');
  result = result.replace(/\[Nombre_Negocio\]/gi, data.businessName || 'Mi Negocio');
  result = result.replace(/\[Fecha_Cita\]/gi, data.date || 'Jueves 22 de Agosto');
  result = result.replace(/\[Hora_Cita\]/gi, data.time || '4:30 PM');
  result = result.replace(/\[Servicio\]/gi, data.service || 'Servicio Principal');
  result = result.replace(/\[Colaborador\]/gi, data.specialist || 'Especialista');
  result = result.replace(/\[Direccion_Negocio\]/gi, data.address || 'Av. Principal #123');
  result = result.replace(/\[WhatsApp_Negocio\]/gi, data.whatsapp || '+52 33 1234 5678');
  return result;
}
