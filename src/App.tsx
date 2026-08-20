import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BusinessForm } from './components/BusinessForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { InteractiveChat } from './components/InteractiveChat';
import { HelpModal } from './components/HelpModal';
import { BusinessFormData, GeneratedCRMSystem, ChatMessage, StoredBusinessProfile } from './types';
import { BUSINESS_PRESETS } from './data/presets';
import { generateCRMClientSide } from './services/geminiClient';
import {
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  FileSpreadsheet,
  MessageSquare,
  HelpCircle,
  HardDrive,
  Building2,
  Plus,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  BUSINESSES_LIST: 'crm_master_pro_businesses_list',
  ACTIVE_BUSINESS_ID: 'crm_master_pro_active_business_id',
  FORM: 'crm_master_pro_form_data',
  CRM: 'crm_master_pro_generated_crm',
  CHAT: 'crm_master_pro_chat_history',
};

export default function App() {
  // Multibusiness profiles list in LocalStorage
  const [businesses, setBusinesses] = useState<StoredBusinessProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUSINESSES_LIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading businesses list', e);
    }
    return [];
  });

  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID) || null;
    } catch {
      return null;
    }
  });

  // Current working form data
  const [formData, setFormData] = useState<BusinessFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORM);
      return saved ? JSON.parse(saved) : BUSINESS_PRESETS[0].data;
    } catch {
      return BUSINESS_PRESETS[0].data;
    }
  });

  // Current active generated CRM system
  const [crmSystem, setCrmSystem] = useState<GeneratedCRMSystem | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CRM);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Current active chat history
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

  // Sync businesses list to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES_LIST, JSON.stringify(businesses));
    } catch (e) {
      console.warn('Could not save businesses list to localStorage', e);
    }
  }, [businesses]);

  // Sync activeBusinessId to LocalStorage
  useEffect(() => {
    try {
      if (activeBusinessId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID, activeBusinessId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_BUSINESS_ID);
      }
    } catch (e) {
      console.warn('Could not save active business ID', e);
    }
  }, [activeBusinessId]);

  // Sync form, CRM and chat to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORM, JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data', e);
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
      console.warn('Could not save CRM data', e);
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
      console.warn('Could not save chat history', e);
    }
  }, [chatHistory]);

  // Handle Switching between registered businesses
  const handleSelectBusiness = (businessId: string) => {
    const target = businesses.find((b) => b.id === businessId);
    if (!target) return;

    setActiveBusinessId(target.id);
    setFormData(target.formData);
    setCrmSystem(target.crmSystem);
    setChatHistory(target.chatHistory || []);
    setErrorMessage(null);
  };

  // Handle adding a brand new business: switch view back to form
  const handleAddNewBusiness = () => {
    setActiveBusinessId(null);
    setCrmSystem(null);
    setChatHistory([]);
    setFormData({
      ...BUSINESS_PRESETS[0].data,
      businessName: '',
      city: 'Tegucigalpa',
      country: 'Honduras',
      services: '',
    });
    setErrorMessage(null);
  };

  // Generate CRM for the current form data and register/update in businesses list
  const handleGenerateCRM = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const generatedData = await generateCRMClientSide(formData);

      if (generatedData && generatedData.businessSummary) {
        setCrmSystem(generatedData);

        const businessName = generatedData.businessSummary.name || formData.businessName || 'Mi Negocio';
        const businessId = activeBusinessId || `biz_${businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;

        const initialGreeting: ChatMessage = {
          id: 'init-bot',
          role: 'assistant',
          content: `¡Hola! He preparado el **Gestor de Clientes, Entradas y Cuentas por Cobrar** para **${businessName}**, guardado de forma 100% segura en tu navegador.\n\nPuedes explorar las pestañas de **Gestor de Clientes**, **Plantillas de WhatsApp**, **Entradas, Cuentas por Cobrar & Gastos** y la **Guía Paso a Paso**. ¡Todo listo para organizar cobros y saldos pendientes!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const newChat = [initialGreeting];
        setChatHistory(newChat);
        setActiveBusinessId(businessId);

        // Update businesses profile in list
        setBusinesses((prev) => {
          const existingIndex = prev.findIndex((b) => b.id === businessId || b.name.toLowerCase() === businessName.toLowerCase());
          const newProfile: StoredBusinessProfile = {
            id: businessId,
            name: businessName,
            businessType: formData.businessType,
            city: formData.city || 'Ciudad',
            country: formData.country || 'País',
            currency: formData.currency || 'HNL',
            currencySymbol: formData.currencySymbol || 'L',
            createdAt: new Date().toISOString(),
            formData: formData,
            crmSystem: generatedData,
            chatHistory: newChat,
          };

          if (existingIndex >= 0) {
            const copy = [...prev];
            copy[existingIndex] = newProfile;
            return copy;
          } else {
            return [newProfile, ...prev];
          }
        });

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

  const handleOpenChatWithPrompt = (prompt: string) => {
    setExternalPrompt(prompt);
  };

  // Sync live refinements from Chat back to the stored profile
  const handleCRMUpdatedFromChat = (updatedCRM: GeneratedCRMSystem) => {
    setCrmSystem(updatedCRM);
    if (activeBusinessId) {
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === activeBusinessId
            ? { ...b, crmSystem: updatedCRM, chatHistory }
            : b
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Subtle Dark SaaS Ambient Gradients & Geometric Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 right-10 w-[500px] h-[350px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Global Multibusiness Header */}
      <Header
        businesses={businesses}
        activeBusinessId={activeBusinessId}
        onSelectBusiness={handleSelectBusiness}
        onAddNewBusiness={handleAddNewBusiness}
        onOpenHelp={() => setIsHelpOpen(true)}
        hasGeneratedCRM={!!crmSystem}
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
                <span>Gestor Operativo & Financiero Gratuito</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Gestor de Clientes, Entradas{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  y Cuentas por Cobrar
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Organiza tus servicios, cobros diarios y saldos pendientes
              </p>
            </div>

            {/* Panel Destacado de Negocios Registrados */}
            {businesses.length > 0 && (
              <div className="bg-gradient-to-br from-[#0e1628] via-[#0d1322] to-[#0a0f1d] p-5 sm:p-6 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Building2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        Tus Negocios Registrados
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                          {businesses.length}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Selecciona un negocio para abrir su panel operativo y cuentas por cobrar:
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {businesses.map((b) => {
                    const storageKey = `crm_sales_db_${b.id || b.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                    let pendingDebt = 0;
                    try {
                      const raw = localStorage.getItem(storageKey);
                      if (raw) {
                        const parsedSales = JSON.parse(raw);
                        if (Array.isArray(parsedSales)) {
                          pendingDebt = parsedSales.reduce((sum: number, s: any) => sum + (Number(s.montoPendiente) || 0), 0);
                        }
                      }
                    } catch {}

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleSelectBusiness(b.id)}
                        className="p-4 rounded-xl bg-[#131b2e] hover:bg-[#19243d] border border-slate-700/80 hover:border-emerald-500/60 transition-all text-left group flex flex-col justify-between space-y-3 cursor-pointer shadow-md hover:shadow-emerald-950/40 hover:-translate-y-0.5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors truncate">
                              {b.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                              {b.city}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{b.city}, {b.country}</span>
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Total Pendiente por Cobrar:
                          </span>
                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${pendingDebt > 0 ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'}`}>
                            {b.currencySymbol || '$'} {pendingDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-back-to-edit"
                  onClick={() => setCrmSystem(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#0d1322] hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-colors shadow-md cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modificar datos de {crmSystem.businessSummary.name}</span>
                </button>

                <button
                  type="button"
                  id="btn-new-business-from-dash"
                  onClick={handleAddNewBusiness}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 px-3 py-2 rounded-xl border border-emerald-700/80 transition-colors shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Registrar Otro Negocio</span>
                </button>
              </div>

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
              businessId={activeBusinessId || crmSystem.businessSummary.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}
              businessData={formData}
              onOpenChatWithPrompt={handleOpenChatWithPrompt}
            />

            {/* Interactive Refinement Chat */}
            <InteractiveChat
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              currentCRM={crmSystem}
              businessData={formData}
              onCRMUpdated={handleCRMUpdatedFromChat}
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
