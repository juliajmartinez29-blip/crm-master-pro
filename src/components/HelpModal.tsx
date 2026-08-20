import React, { useEffect } from 'react';
import {
  HelpCircle,
  X,
  Zap,
  FormInput,
  Sparkles,
  Copy,
  MessageSquare,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key press & prevent background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="help-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="help-modal-content"
        className="relative w-full max-w-2xl bg-[#0c1220] rounded-2xl shadow-2xl shadow-emerald-950/40 border border-slate-700/80 overflow-hidden flex flex-col max-h-[90vh] text-slate-200 animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#090d16] via-[#0d1424] to-[#090d16] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b101d] rounded-[9.5px] flex items-center justify-center text-emerald-400 font-bold text-lg">
                ❓
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                ¿Cómo usar CRM Master Pro?
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Manual de Uso
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Paso a paso para diseñar tu sistema de control 100% gratis
              </p>
            </div>
          </div>

          <button
            id="btn-close-help-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Section 1: Purpose */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-2 mb-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              1. ¿Para qué sirve esta herramienta?
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Esta plataforma utiliza <strong className="text-white">Inteligencia Artificial</strong> para diseñar un sistema de gestión (CRM), plantillas de mensajería para WhatsApp y formatos de control financiero adaptados 100% a tu negocio y <strong className="text-emerald-400">sin pagar suscripciones</strong>.
            </p>
          </div>

          {/* Section 2: Guide of Main Buttons & Controls */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>2. Guía de uso de los botones principales:</span>
            </h4>

            <div className="space-y-3">
              {/* Feature 1 */}
              <div className="p-3.5 bg-slate-900/90 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    ⚡ Botones de "Cargar Ejemplo Rápido"
                  </h5>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Ubicados arriba del formulario. Al hacer clic en cualquiera de ellos (Barbería, Estilista, Clínica Dental, etc.), el formulario se llenará automáticamente con datos de prueba para que veas cómo funciona el sistema de inmediato.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 bg-slate-900/90 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <FormInput className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    📋 Campos del Formulario
                  </h5>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Completa la información real de tu negocio (Servicios, Moneda, Precios y Comisiones) para que la IA personalice el contenido a tu medida.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 bg-slate-900/90 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    🚀 Botón "Generar mi Sistema CRM (100% Gratis)"
                  </h5>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Procesa los datos ingresados y genera en la pantalla principal tus fichas de clientes, mensajes de WhatsApp automatizados y la guía de configuración.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-3.5 bg-slate-900/90 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Copy className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    📋 Botones de "Copiar"
                  </h5>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Aparecen junto a cada respuesta o plantilla generada. Permite copiar el texto o mensaje directo al portapapeles con un solo clic para pegarlo en WhatsApp o en tu hoja de cálculo.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="p-3.5 bg-slate-900/90 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    💬 Panel de Ajustes / Chat interactivo
                  </h5>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Si deseas agregar, modificar o borrar algún campo de la ficha generada, escribe directamente en la caja de chat (ej: <em className="text-slate-200">"Agrega un campo para alergias"</em> o <em className="text-slate-200">"Cambia los precios a dólares"</em>) y el sistema actualizará tu tabla.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Final Recommendation */}
          <div className="bg-[#080d1a] text-slate-200 rounded-xl p-4.5 border border-slate-800/90">
            <h4 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3. Recomendación final
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Una vez generadas tus plantillas, copia los resultados y utilízalos en herramientas gratuitas como <strong className="text-white">Google Sheets</strong>, <strong className="text-white">Google Forms</strong> o <strong className="text-white">Notion</strong> para llevar el control diario de tus clientes.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#090d16] px-6 py-4 border-t border-slate-800/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Gratis • Sin pagos recurrentes</span>
          </div>
          <button
            id="btn-modal-understand"
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>¡Entendido!</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
