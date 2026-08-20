import React from 'react';
import {
  Sparkles,
  Database,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Building2,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { StoredBusinessProfile } from '../types';

interface HeaderProps {
  businesses: StoredBusinessProfile[];
  activeBusinessId: string | null;
  onSelectBusiness: (businessId: string) => void;
  onAddNewBusiness: () => void;
  onOpenHelp: () => void;
  hasGeneratedCRM: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  businesses,
  activeBusinessId,
  onSelectBusiness,
  onAddNewBusiness,
  onOpenHelp,
  hasGeneratedCRM,
}) => {
  const activeBusiness = businesses.find((b) => b.id === activeBusinessId);

  return (
    <header className="w-full bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 text-white sticky top-0 z-40 shadow-2xl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
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
                    Multinegocio
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistemas CRM Gratuitos para Negocios de Belleza & Salud
              </p>
            </div>
          </div>

          {/* Mobile Help Button */}
          <button
            onClick={onOpenHelp}
            className="md:hidden inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg shadow-md shadow-emerald-950/40 transition-all border border-emerald-400/30 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ayuda</span>
          </button>
        </div>

        {/* Center: Multibusiness Switcher & New Business Action */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-center flex-wrap">
          {businesses.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#0e1526] p-1 rounded-xl border border-slate-700/80 shadow-inner">
              <div className="flex items-center gap-1.5 pl-2.5 pr-1 text-xs text-slate-400 font-medium">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline text-[11px] uppercase font-bold text-slate-400">Negocio:</span>
              </div>
              <div className="relative">
                <select
                  id="header-select-business"
                  value={activeBusinessId || ''}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      onAddNewBusiness();
                    } else if (e.target.value) {
                      onSelectBusiness(e.target.value);
                    }
                  }}
                  className="bg-[#141d33] hover:bg-[#1a2540] text-emerald-300 font-bold text-xs py-1.5 pl-2.5 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-colors cursor-pointer appearance-none max-w-[200px] sm:max-w-[240px] truncate"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0f172a] text-slate-100 font-semibold py-1">
                      {b.name} ({b.city})
                    </option>
                  ))}
                  <option value="__NEW__" className="bg-[#064e3b] text-emerald-200 font-bold py-1">
                    + Registrar Nuevo Negocio...
                  </option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Featured Button: + Registrar Nuevo Negocio */}
          <button
            type="button"
            id="header-btn-add-new-business"
            onClick={onAddNewBusiness}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 shadow-md shadow-emerald-950/40 transition-all active:scale-[0.98] cursor-pointer"
            title="Crear un nuevo perfil de negocio desde el formulario"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-200" />
            <span>+ Registrar Nuevo Negocio</span>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3 justify-end w-full md:w-auto">
          {/* Help Button on Desktop */}
          <button
            id="header-btn-help"
            onClick={onOpenHelp}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0e1526] hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
            title="Ver manual de instrucciones paso a paso"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>¿Cómo usar?</span>
          </button>

          <div className="hidden lg:flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/70 px-2.5 py-1.5 rounded-lg border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Gratis</span>
          </div>
        </div>
      </div>
    </header>
  );
};
