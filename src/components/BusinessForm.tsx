import React, { useState } from 'react';
import {
  Scissors,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Users,
  FileText,
  Zap,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { BusinessFormData, BusinessType, TeamScheme } from '../types';
import { BUSINESS_PRESETS, COUNTRY_CURRENCY_MAP } from '../data/presets';

interface BusinessFormProps {
  formData: BusinessFormData;
  setFormData: React.Dispatch<React.SetStateAction<BusinessFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const handleCountryChange = (countryName: string) => {
    const matched = COUNTRY_CURRENCY_MAP[countryName] || { currency: 'USD', symbol: '$' };
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      currency: matched.currency,
      currencySymbol: matched.symbol,
    }));
  };

  const applyPreset = (presetId: string) => {
    const preset = BUSINESS_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setFormData(preset.data);
    }
  };

  // Button is enabled dynamically as soon as Business Name and City are entered
  const isFormValid =
    formData.businessName.trim().length > 0 &&
    formData.city.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isLoading) {
      // Ensure services has a sensible default if left empty
      if (!formData.services || formData.services.trim().length === 0) {
        setFormData((prev) => ({
          ...prev,
          services: 'Servicio Principal, Atención General, Tratamiento Especializado',
        }));
      }
      onSubmit();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 text-slate-800">
      {/* Preset Quick Loader */}
      <div className="mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Cargar Ejemplo Rápido
          </label>
          <span className="text-[11px] text-slate-400">1-clic para autocompletar</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BUSINESS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              id={`preset-btn-${preset.id}`}
              onClick={() => applyPreset(preset.id)}
              className={`text-xs font-medium px-3 py-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                selectedPresetId === preset.id
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm font-semibold'
                  : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-base">{preset.label.split(' ')[0]}</span>
              <span className="truncate">{preset.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Tipo de Negocio y Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="businessType"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Tipo de Negocio <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="businessType"
                value={formData.businessType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    businessType: e.target.value as BusinessType,
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm appearance-none font-medium transition-all"
              >
                <option value="barberia">💈 Barbería & Peluquería Masculina</option>
                <option value="clinica_belleza">✨ Clínica de Estética & Belleza</option>
                <option value="estilista_independiente">💇‍♀️ Estilista Independiente & Colorimetría</option>
                <option value="clinica_dental">🦷 Clínica Dental & Odontología</option>
                <option value="spa_masajes">🌿 Spa, Masajes & Terapias</option>
                <option value="unas_pestanas">💅 Estudio de Uñas & Pestañas (Lashes)</option>
                <option value="otro">🏷️ Otro Negocio de Salud / Cuidado Personal</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formData.businessType === 'otro' && (
              <input
                type="text"
                id="customBusinessType"
                placeholder="Ej. Podología, Fisioterapia, Tatuajes..."
                value={formData.customBusinessType || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customBusinessType: e.target.value }))
                }
                className="mt-2 w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="businessName"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Nombre del Negocio / Profesional <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="businessName"
                required
                placeholder="Ej. Barbería Imperio / Dra. Laura Gómez"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, businessName: e.target.value }))
                }
                className="w-full pl-9 bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Ubicación (Ciudad, País, Moneda) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="country"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              País (Moneda Local)
            </label>
            <div className="relative">
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm appearance-none font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                {Object.keys(COUNTRY_CURRENCY_MAP).map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')} ({COUNTRY_CURRENCY_MAP[c].currency})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="city"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Ciudad <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="city"
                required
                placeholder="Ej. Tegucigalpa, San Pedro Sula, Bogotá..."
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full pl-9 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Dirección o Zona (Opcional)
            </label>
            <input
              type="text"
              id="address"
              placeholder="Ej. Centro Histórico / Sucursal Norte"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Row 3: Canales de Contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="whatsapp"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              WhatsApp de Atención al Cliente
            </label>
            <div className="relative">
              <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="whatsapp"
                placeholder="Ej. +504 9988-7766"
                value={formData.whatsapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                className="w-full pl-9 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Teléfono Fijo / Redes (Opcional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="phone"
                placeholder="Ej. @mi_negocio / 2233-4455"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-9 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Servicios Principales y Precios (Opcional / Sugerido) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="services"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Servicios Principales y Precios Aproximados (Opcional)
            </label>
            <span className="text-[11px] text-slate-400">
              Moneda: {formData.currencySymbol} ({formData.currency})
            </span>
          </div>
          <textarea
            id="services"
            rows={3}
            placeholder={`Ejemplo:\n- Corte Degradado / Fade: ${formData.currencySymbol}25\n- Arreglo de Barba con Toalla Caliente: ${formData.currencySymbol}15\n- Tratamiento Hidratante Premium: ${formData.currencySymbol}40`}
            value={formData.services}
            onChange={(e) => setFormData((prev) => ({ ...prev, services: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 rounded-xl p-3 text-sm font-medium transition-all"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-generate-crm"
            disabled={!isFormValid || isLoading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 ${
              !isFormValid || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Diseñando tu Sistema CRM Gratuito con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generar mi Sistema CRM (100% Gratis)</span>
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Configura tus clientes, registro de servicios, cobros diarios y cuentas por cobrar.
          </p>
        </div>
      </form>
    </div>
  );
};
