import React, { useState } from 'react';
import {
  FileSpreadsheet,
  MessageSquare,
  Users,
  BookOpen,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Eye,
  Send,
  Calculator,
  Layers,
  HelpCircle,
  Clock,
  Tag,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { GeneratedCRMSystem, WhatsAppTemplate, CRMField } from '../types';
import {
  copyToClipboard,
  downloadCSV,
  downloadMarkdown,
  generateCRMAsMarkdown,
  fillTemplateVariables,
} from '../utils/exportUtils';
import confetti from 'canvas-confetti';

interface ResultsDashboardProps {
  crm: GeneratedCRMSystem;
  onOpenChatWithPrompt: (prompt: string) => void;
}

type TabType = 'ficha' | 'plantillas' | 'colaboradores' | 'guia';

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  crm,
  onOpenChatWithPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ficha');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // WhatsApp template simulation state
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [simClientName, setSimClientName] = useState('Mariana Soto');
  const [simDate, setSimDate] = useState('Viernes 25 de Agosto');
  const [simTime, setSimTime] = useState('3:00 PM');
  const [simService, setSimService] = useState('Corte y Tratamiento');
  const [simSpecialist, setSimSpecialist] = useState('Carlos M.');

  // Interactive Commission Simulator State
  const [calcServicePrice, setCalcServicePrice] = useState<number>(50);
  const [calcCommissionPct, setCalcCommissionPct] = useState<number>(40);

  const handleCopy = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDownloadFichaCSV = () => {
    const headers = ['Campo', 'Categoría', 'Tipo de Dato', 'Obligatorio', 'Ejemplo', 'Para qué sirve / Importancia'];
    const rows = crm.fichaCliente.fields.map((f) => [
      f.name,
      f.category,
      f.type,
      f.isRequired ? 'Sí' : 'Opcional',
      f.example,
      f.purpose,
    ]);
    downloadCSV(`${crm.businessSummary.name.replace(/\s+/g, '_')}_Ficha_Cliente_CRM.csv`, headers, rows);
  };

  const handleDownloadClosingCSV = () => {
    const headers = crm.moduloColaboradores.dailyClosingColumns.map((c) => c.columnName);
    const rows = crm.moduloColaboradores.sampleClosingRows.map((r) => [
      '2026-08-19',
      r.colaborador,
      'Cliente Ejemplo',
      r.servicio,
      r.monto,
      r.metodoPago,
      '40%',
      r.comisionCalculada,
      'Ganancia',
    ]);
    downloadCSV(`${crm.businessSummary.name.replace(/\s+/g, '_')}_Cierre_Diario.csv`, headers, rows);
  };

  const handleDownloadFullMarkdown = () => {
    const md = generateCRMAsMarkdown(crm);
    downloadMarkdown(`${crm.businessSummary.name.replace(/\s+/g, '_')}_Sistema_CRM_Gratuito.md`, md);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const currentTemplate = crm.plantillasMensajes[selectedTemplateIndex] || crm.plantillasMensajes[0];
  const renderedMessage = currentTemplate
    ? fillTemplateVariables(currentTemplate.templateText, {
        clientName: simClientName,
        businessName: crm.businessSummary.name,
        date: simDate,
        time: simTime,
        service: simService,
        specialist: simSpecialist,
      })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Top Banner / Executive Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                {crm.businessSummary.typeLabel}
              </span>
              <span className="text-xs text-slate-400">• {crm.businessSummary.location}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {crm.businessSummary.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {crm.businessSummary.recommendation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-full-md"
              onClick={handleDownloadFullMarkdown}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 transition-all shadow-sm"
              title="Descargar toda la documentación en Markdown"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar Guía (.MD)</span>
            </button>
            <button
              id="btn-copy-all-crm"
              onClick={() => {
                handleCopy('copy-all', generateCRMAsMarkdown(crm));
                triggerCelebration();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-700/20"
            >
              {copiedId === 'copy-all' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Sistema Completo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
          <button
            id="tab-ficha"
            onClick={() => setActiveTab('ficha')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'ficha'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Ficha de Cliente (CRM)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
              {crm.fichaCliente.fields.length} campos
            </span>
          </button>

          <button
            id="tab-plantillas"
            onClick={() => setActiveTab('plantillas')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'plantillas'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>2. Plantillas WhatsApp & Mensajes</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
              {crm.plantillasMensajes.length} plantillas
            </span>
          </button>

          <button
            id="tab-colaboradores"
            onClick={() => setActiveTab('colaboradores')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'colaboradores'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Control Colaboradores & Finanzas</span>
          </button>

          <button
            id="tab-guia"
            onClick={() => setActiveTab('guia')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'guia'
                ? 'bg-slate-800 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>4. Guía Gratuita Paso a Paso</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-5 sm:p-7">
        {/* ================= TAB 1: FICHA DE CLIENTE ================= */}
        {activeTab === 'ficha' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  {crm.fichaCliente.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{crm.fichaCliente.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-download-csv-ficha"
                  onClick={handleDownloadFichaCSV}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar CSV para Google Sheets</span>
                </button>
                <button
                  id="btn-copy-ficha"
                  onClick={() => {
                    const text = crm.fichaCliente.fields
                      .map((f) => `${f.name} (${f.type}) - ${f.purpose} [Ej: ${f.example}]`)
                      .join('\n');
                    handleCopy('ficha-fields', text);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedId === 'ficha-fields' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Campos</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Note banner required by instructions */}
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Nota editable: </span>
                <span>{crm.fichaCliente.note}</span>
                <div className="mt-1.5 flex gap-2 flex-wrap">
                  <button
                    onClick={() =>
                      onOpenChatWithPrompt('Por favor agrega un campo de "Alergias a productos químicos" a la ficha de cliente')
                    }
                    className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950"
                  >
                    + Agregar campo en el chat
                  </button>
                  <span className="text-amber-400">•</span>
                  <button
                    onClick={() =>
                      onOpenChatWithPrompt('Por favor quita los campos que no sean estrictamente obligatorios')
                    }
                    className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950"
                  >
                    - Simplificar campos
                  </button>
                </div>
              </div>
            </div>

            {/* Structured Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Nombre del Campo</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Tipo de Dato</th>
                      <th className="py-3 px-4">Ejemplo Real</th>
                      <th className="py-3 px-4">Para qué sirve / Importancia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {crm.fichaCliente.fields.map((field, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          field.category.includes('Especialidad') ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{field.name}</span>
                          {field.isRequired && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                              Req
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              field.category === 'Datos Generales'
                                ? 'bg-blue-100 text-blue-800'
                                : field.category.includes('Especialidad')
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : field.category.includes('Preferencias')
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {field.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {field.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 italic">
                          "{field.example}"
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {field.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Sample Client Profile Simulator */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Simulador: Vista previa de una Ficha de Cliente Real
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Así se ve el perfil registrado en tu base de datos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                {crm.fichaCliente.fields.slice(0, 9).map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      {f.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {crm.fichaCliente.sampleClientData?.[f.name] || f.example}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PLANTILLAS WHATSAPP ================= */}
        {activeTab === 'plantillas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Plantillas de Comunicación por WhatsApp y Correo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mensajes listos con etiquetas dinámicas para automatizar el contacto con tus clientes.
                </p>
              </div>

              <button
                id="btn-copy-all-templates"
                onClick={() => {
                  const allTxt = crm.plantillasMensajes
                    .map((t) => `--- ${t.title} ---\n${t.templateText}\n`)
                    .join('\n');
                  handleCopy('all-templates', allTxt);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedId === 'all-templates' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Todas copiadas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Todas las Plantillas</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Template Selector & Previews */}
              <div className="lg:col-span-7 space-y-4">
                {crm.plantillasMensajes.map((template, idx) => (
                  <div
                    key={template.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      selectedTemplateIndex === idx
                        ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/15'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {idx + 1}. {template.title}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedTemplateIndex(idx)}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                            selectedTemplateIndex === idx
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Probar
                        </button>
                        <button
                          onClick={() => handleCopy(`tpl-${idx}`, template.templateText)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                          title="Copiar texto con etiquetas"
                        >
                          {copiedId === `tpl-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-2.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{template.recommendedTiming}</span>
                    </div>

                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
                      {template.templateText}
                    </pre>

                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Variables:</span>
                      {template.variables?.map((v, vi) => (
                        <span
                          key={vi}
                          className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Live WhatsApp Phone Simulator */}
              <div className="lg:col-span-5">
                <div className="sticky top-20 bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Simulador WhatsApp en Vivo
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Prueba con datos reales</span>
                  </div>

                  {/* Simulator inputs */}
                  <div className="space-y-2 mb-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                        Nombre del Cliente:
                      </label>
                      <input
                        type="text"
                        value={simClientName}
                        onChange={(e) => setSimClientName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                          Fecha:
                        </label>
                        <input
                          type="text"
                          value={simDate}
                          onChange={(e) => setSimDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                          Hora:
                        </label>
                        <input
                          type="text"
                          value={simTime}
                          onChange={(e) => setSimTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mock WhatsApp Chat Balloon */}
                  <div className="bg-[#0b141a] rounded-xl p-4 min-h-[220px] flex flex-col justify-end border border-slate-800/80">
                    <div className="bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[92%] self-end shadow-md relative">
                      <p className="whitespace-pre-wrap">{renderedMessage}</p>
                      <span className="text-[9px] text-emerald-200/60 block text-right mt-1.5 font-mono">
                        12:45 PM ✓✓
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      id="btn-copy-simulated-msg"
                      onClick={() => handleCopy('sim-msg', renderedMessage)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedId === 'sim-msg' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Mensaje Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Mensaje Listo</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(renderedMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1"
                      title="Abrir en WhatsApp Web / App"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Enviar</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CONTROL DE COLABORADORES ================= */}
        {activeTab === 'colaboradores' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Módulo de Control de Empleados, Cierre Diario & Comisiones
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esquema: <span className="font-semibold text-slate-800">{crm.moduloColaboradores.modelType}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-download-closing-csv"
                  onClick={handleDownloadClosingCSV}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Plantilla Cierre (.CSV)</span>
                </button>
              </div>
            </div>

            {/* Daily Closing Columns Format */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Estructura de Columnas para la Pestaña "Cierre Diario" en Google Sheets
                </span>
                <span className="text-[11px] text-slate-400">Fila 1 de tu Hoja</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 uppercase font-semibold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Columna</th>
                      <th className="py-2.5 px-4">Descripción</th>
                      <th className="py-2.5 px-4">Fórmula en Google Sheets</th>
                      <th className="py-2.5 px-4">Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {crm.moduloColaboradores.dailyClosingColumns.map((col, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-4 font-bold text-slate-900 font-mono">
                          {col.columnName}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{col.description}</td>
                        <td className="py-2.5 px-4">
                          <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                            {col.formula || 'Entrada manual'}
                          </code>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{col.exampleValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample Daily Closing Rows */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Ejemplo de Cierre de Caja del Día (Simulación)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {crm.moduloColaboradores.sampleClosingRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{row.colaborador}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {row.monto}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{row.servicio}</p>
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Pago: {row.metodoPago}</span>
                      <span className="font-semibold text-slate-700">Comisión: {row.comisionCalculada}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Commission Simulator */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 border border-slate-700 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Calculadora Interactiva de Reparto de Ganancias
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    Precio del Servicio ({crm.businessSummary.currency}):
                  </label>
                  <input
                    type="number"
                    value={calcServicePrice}
                    onChange={(e) => setCalcServicePrice(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    % Comisión Colaborador:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={calcCommissionPct}
                    onChange={(e) => setCalcCommissionPct(Number(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                  />
                </div>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-700 flex flex-col justify-center">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Colaborador:</span>
                    <span className="font-bold text-emerald-400">
                      ${((calcServicePrice * calcCommissionPct) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Negocio (Neto):</span>
                    <span className="font-bold text-amber-300">
                      ${(calcServicePrice - (calcServicePrice * calcCommissionPct) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Rules */}
              <div className="pt-3 border-t border-slate-700 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-emerald-400 block mb-1">Reglas Clave de Pago:</span>
                {crm.moduloColaboradores.paymentRules.map((rule, idx) => (
                  <p key={idx} className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-emerald-400">•</span>
                    <span>{rule}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: GUÍA PASO A PASO ================= */}
        {activeTab === 'guia' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Guía Gratuita de Implementación Paso a Paso
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aprende a montar este CRM en menos de 15 minutos con herramientas 100% gratuitas.
                </p>
              </div>

              <button
                id="btn-copy-guide"
                onClick={() => {
                  const guideTxt = crm.guiaPasoAPaso.steps
                    .map((s) => `PASO ${s.stepNumber}: ${s.title}\n${s.description}\nTip: ${s.actionableTip}\n`)
                    .join('\n');
                  handleCopy('guide-txt', guideTxt);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedId === 'guide-txt' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Guía copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Guía</span>
                  </>
                )}
              </button>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crm.guiaPasoAPaso.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {step.description}
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-100 text-[11px] text-emerald-900">
                    <span className="font-bold">💡 Consejo Práctico: </span>
                    <span>{step.actionableTip}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Sheets Formula Helpers */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Fórmulas Útiles de Google Sheets Listas para Copiar
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {crm.guiaPasoAPaso.googleSheetsFormulaHelpers.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {formula.formulaName}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{formula.explanation}</p>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 text-emerald-400 p-2 rounded font-mono text-xs">
                      <span className="truncate">{formula.formulaCode}</span>
                      <button
                        onClick={() => handleCopy(`fml-${idx}`, formula.formulaCode)}
                        className="text-slate-400 hover:text-white ml-1 p-0.5"
                        title="Copiar fórmula"
                      >
                        {copiedId === `fml-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Free Tools */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Herramientas 100% Gratuitas Recomendadas
                </span>
                <span className="text-[10px] text-slate-400">Cero suscripciones de pago</span>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {crm.freeToolsRecommended.map((tool, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{tool.toolName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.2 rounded-full">
                          {tool.cost}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{tool.howToUse}</p>
                    </div>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0"
                    >
                      <span>Abrir {tool.toolName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
