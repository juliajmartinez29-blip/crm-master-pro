import React, { useState } from 'react';
import {
  Scissors,
  Sparkles,
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Users,
  Percent,
  Layers,
  FileText,
  Zap,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { BusinessFormData, BusinessType, TeamScheme, PaymentScheme } from '../types';
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

  const isFormValid =
    formData.businessName.trim().length > 0 &&
    formData.city.trim().length > 0 &&
    formData.services.trim().length > 0;

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isFormValid && !isLoading) {
            onSubmit();
          }
        }}
        className="space-y-5"
      >
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
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm appearance-none font-medium focus:ring-2 focus:ring-emerald-500/20"
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
                placeholder="Ej. Guadalajara, Bogotá, Madrid..."
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full pl-9 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
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
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
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
                placeholder="Ej. +52 33 1234 5678"
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
                placeholder="Ej. @mi_negocio_salon / 33 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-9 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Equipo y Esquema de Trabajo / Pagos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <label
              htmlFor="teamScheme"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Equipo de Trabajo
            </label>
            <div className="relative">
              <select
                id="teamScheme"
                value={formData.teamScheme}
                onChange={(e) => {
                  const val = e.target.value as TeamScheme;
                  let count = 1;
                  if (val === 'pequeno_1_3') count = 3;
                  if (val === 'mediano_4_10') count = 6;
                  if (val === 'grande_10_mas') count = 12;
                  setFormData((prev) => ({ ...prev, teamScheme: val, collaboratorsCount: count }));
                }}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm appearance-none font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="independiente">👤 Profesional Solo / Independiente (1)</option>
                <option value="pequeno_1_3">👥 Pequeño equipo (1 a 3 colaboradores)</option>
                <option value="mediano_4_10">🏢 Mediano equipo (4 a 10 colaboradores)</option>
                <option value="grande_10_mas">🏬 Gran equipo (+10 colaboradores)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="paymentScheme"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Esquema de Pagos / Comisiones
            </label>
            <div className="relative">
              <select
                id="paymentScheme"
                value={formData.paymentScheme}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentScheme: e.target.value as PaymentScheme,
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm appearance-none font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="comision">📊 Porcentaje de Comisión por Servicio</option>
                <option value="renta_espacio">💺 Renta de Espacio / Silla Mensual</option>
                <option value="sueldo_fijo">💼 Sueldo Fijo Quincenal / Mensual</option>
                <option value="mixto">🔄 Mixto (Sueldo Base + Comisión Menor)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="commissionPercentage"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {formData.paymentScheme === 'comision' || formData.paymentScheme === 'mixto'
                ? '% Comisión Promedio'
                : 'Detalle de Cuota / Renta'}
            </label>
            <div className="relative">
              <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                id="commissionPercentage"
                min="0"
                max="100"
                placeholder="40"
                value={formData.commissionPercentage || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    commissionPercentage: Number(e.target.value) || 0,
                  }))
                }
                className="w-full pl-9 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Row 5: Servicios Principales y Precios */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="services"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Servicios Principales y Precios Aproximados <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Moneda: {formData.currencySymbol} ({formData.currency})
            </span>
          </div>
          <textarea
            id="services"
            required
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
            Configura Google Sheets, WhatsApp Business y Notion sin gastar en software de pago.
          </p>
        </div>
      </form>
    </div>
  );
};
