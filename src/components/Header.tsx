import React from 'react';
import {
  Sparkles,
  Database,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasGeneratedCRM: boolean;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasGeneratedCRM, onOpenHelp }) => {
  return (
    <header className="w-full bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 text-white sticky top-0 z-40 shadow-2xl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0b101d] rounded-[9.5px] flex items-center justify-center">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  CRM Master Pro
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    100% Gratis
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Diseña el sistema de control para tu negocio 100% Gratis
              </p>
            </div>
          </div>

          {/* Mobile Help Button */}
          <button
            onClick={onOpenHelp}
            className="md:hidden inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg shadow-md shadow-emerald-950/40 transition-all border border-emerald-400/30"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>¿Cómo usar?</span>
          </button>
        </div>

        {/* Center / Highlighted Help Button */}
        <div className="hidden md:flex items-center justify-center">
          <button
            id="header-btn-help"
            onClick={onOpenHelp}
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 transition-all active:scale-[0.98] cursor-pointer"
            title="Ver manual de instrucciones paso a paso"
          >
            <span className="text-base leading-none">❓</span>
            <span className="tracking-wide">¿Cómo usar esta app?</span>
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
          </button>
        </div>

        {/* Right Feature Badges & Action */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end w-full md:w-auto">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Sheets</span>
            <span className="text-slate-700">•</span>
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Business</span>
          </div>

          {hasGeneratedCRM && (
            <button
              id="header-btn-new-crm"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shadow-sm cursor-pointer"
              title="Iniciar nuevo formulario"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Nuevo CRM</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/70 px-2.5 py-1.5 rounded-lg border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sin suscripciones</span>
          </div>
        </div>
      </div>
    </header>
  );
};
