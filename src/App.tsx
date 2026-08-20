import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BusinessForm } from './components/BusinessForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { InteractiveChat } from './components/InteractiveChat';
import { HelpModal } from './components/HelpModal';
import { BusinessFormData, GeneratedCRMSystem, ChatMessage } from './types';
import { BUSINESS_PRESETS } from './data/presets';
import { generateCRMClientSide } from './services/geminiClient';
import { Sparkles, AlertCircle, ArrowLeft, ShieldCheck, FileSpreadsheet, MessageSquare, HelpCircle, HardDrive } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  FORM: 'crm_master_pro_form_data',
  CRM: 'crm_master_pro_generated_crm',
  CHAT: 'crm_master_pro_chat_history',
};

export default function App() {
  // Initialize state with LocalStorage support
  const [formData, setFormData] = useState<BusinessFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORM);
      return saved ? JSON.parse(saved) : BUSINESS_PRESETS[0].data;
    } catch {
      return BUSINESS_PRESETS[0].data;
    }
  });

  const [crmSystem, setCrmSystem] = useState<GeneratedCRMSystem | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CRM);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [externalPrompt, setExternalPrompt] = useState<string>('');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORM, JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data to localStorage', e);
    }
  }, [formData]);

  useEffect(() => {
    try {
      if (crmSystem) {
        localStorage.setItem(STORAGE_KEYS.CRM, JSON.stringify(crmSystem));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CRM);
      }
    } catch (e) {
      console.warn('Could not save CRM data to localStorage', e);
    }
  }, [crmSystem]);

  useEffect(() => {
    try {
      if (chatHistory.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatHistory));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CHAT);
      }
    } catch (e) {
      console.warn('Could not save chat history to localStorage', e);
    }
  }, [chatHistory]);

  const handleGenerateCRM = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Execute 100% Client-Side generation with Gemini direct integration / local engine
      const generatedData = await generateCRMClientSide(formData);

      if (generatedData && generatedData.businessSummary) {
        setCrmSystem(generatedData);

        const initialGreeting: ChatMessage = {
          id: 'init-bot',
          role: 'assistant',
          content: `¡Hola! Soy **CRM Master Pro**. He generado la estructura completa para **${generatedData.businessSummary.name}** guardada de forma 100% segura en tu navegador.\n\nPuedes explorar las pestañas de **Ficha de Cliente**, **Plantillas de WhatsApp**, **Control de Colaboradores** y la **Guía Paso a Paso**. Si deseas agregar o borrar algún campo, o cambiar algún mensaje, ¡escríbemelo aquí!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setChatHistory([initialGreeting]);

        // Launch celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        throw new Error('No se pudo generar la estructura del CRM');
      }
    } catch (err: any) {
      console.error('Error generating CRM:', err);
      setErrorMessage(err.message || 'Ocurrió un error al generar el CRM. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCrmSystem(null);
    setChatHistory([]);
    setErrorMessage(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CRM);
      localStorage.removeItem(STORAGE_KEYS.CHAT);
    } catch (e) {
      console.warn('Could not clear localStorage', e);
    }
  };

  const handleOpenChatWithPrompt = (prompt: string) => {
    setExternalPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle Dark SaaS Ambient Gradients & Geometric Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 right-10 w-[500px] h-[350px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Global Header (Full width, unified dark) */}
      <Header
        onReset={handleReset}
        hasGeneratedCRM={!!crmSystem}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-7 relative z-10">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl flex items-start gap-3 text-rose-200 text-xs shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-rose-300">Error: </span>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* View 1: Initial Form & Business Configuration */}
        {!crmSystem ? (
          <div className="space-y-7 max-w-4xl mx-auto">
            {/* Introductory Hero Banner with SaaS styling */}
            <div className="text-center space-y-3 py-4 sm:py-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-bold border border-emerald-700/60 shadow-lg shadow-emerald-950/40">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generador de Sistemas CRM 100% Gratuitos</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Control Total de tu Negocio{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  sin Suscripciones
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Ingresa los datos de tu negocio de belleza, estética, barbería o salud. La IA diseñará tu base de datos para <strong className="text-slate-200">Google Sheets</strong>, plantillas de <strong className="text-slate-200">WhatsApp</strong> y control de comisiones en segundos.
              </p>
            </div>

            {/* Business Form */}
            <BusinessForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleGenerateCRM}
              isLoading={isLoading}
            />

            {/* Trust Features Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4.5 bg-[#0d1322]/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-md flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-xl shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Google Sheets Optimizado</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Columnas, fórmulas automáticas de comisiones y detección de inactividad.
                  </p>
                </div>
              </div>

              <div className="p-4.5 bg-[#0d1322]/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-md flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-xl shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">WhatsApp Business Listo</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Plantillas con etiquetas dinámicas para confirmar y reactivar clientes.
                  </p>
                </div>
              </div>

              <div className="p-4.5 bg-[#0d1322]/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-md flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-xl shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cero Costos Ocultos</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Tú eres dueño de tus datos en tu propio Google Drive para siempre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: Generated CRM Dashboard + Interactive Chat */
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <button
                id="btn-back-to-edit"
                onClick={() => setCrmSystem(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#0d1322] hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-colors shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modificar datos del negocio</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                  <HardDrive className="w-3 h-3" />
                  <span>Guardado en LocalStorage</span>
                </div>

                <button
                  id="btn-open-help-results"
                  onClick={() => setIsHelpOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-950/90 px-3 py-1.5 rounded-lg border border-emerald-800/70 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>¿Cómo usar este CRM?</span>
                </button>
              </div>
            </div>

            {/* Results Dashboard Tabs */}
            <ResultsDashboard
              crm={crmSystem}
              onOpenChatWithPrompt={handleOpenChatWithPrompt}
            />

            {/* Interactive Refinement Chat */}
            <InteractiveChat
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              currentCRM={crmSystem}
              businessData={formData}
              onCRMUpdated={(updatedCRM) => setCrmSystem(updatedCRM)}
              externalPrompt={externalPrompt}
              onClearExternalPrompt={() => setExternalPrompt('')}
            />
          </div>
        )}
      </main>

      {/* Dark Footer */}
      <footer className="w-full bg-[#080c16] border-t border-slate-800 py-5 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span className="text-slate-400">CRM Master Pro • Asistente de Sistemas CRM Gratuitos para Negocios de Belleza & Salud</span>
          <span className="text-slate-500">Google Sheets • Notion • WhatsApp Business • 100% Client-Side LocalStorage</span>
        </div>
      </footer>
    </div>
  );
}
