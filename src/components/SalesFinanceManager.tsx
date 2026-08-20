import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  PlusCircle,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Trash2,
  Download,
  Check,
  Search,
  Filter,
  AlertCircle,
  FileSpreadsheet,
  Calculator,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { SaleRecord, EmployeeModule } from '../types';
import { downloadCSV } from '../utils/exportUtils';
import confetti from 'canvas-confetti';

interface SalesFinanceManagerProps {
  businessId: string;
  businessName: string;
  currency: string;
  currencySymbol: string;
  commissionDefault: number;
  moduloColaboradores: EmployeeModule;
  servicesList?: string;
  collaboratorsCount?: number;
}

export const SalesFinanceManager: React.FC<SalesFinanceManagerProps> = ({
  businessId,
  businessName,
  currency,
  currencySymbol = '$',
  commissionDefault = 40,
  moduloColaboradores,
  servicesList = '',
  collaboratorsCount = 2,
}) => {
  const storageKey = useMemo(
    () => `crm_sales_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessId, businessName]
  );

  // Suggested collaborator names based on sample closing rows or defaults
  const suggestedCollaborators = useMemo(() => {
    const names = new Set<string>();
    if (moduloColaboradores?.sampleClosingRows) {
      moduloColaboradores.sampleClosingRows.forEach((r) => names.add(r.colaborador));
    }
    if (names.size === 0) {
      names.add('Carlos M.');
      names.add('Laura G.');
      names.add('Andrés P.');
    }
    return Array.from(names);
  }, [moduloColaboradores]);

  // Suggested services
  const suggestedServices = useMemo(() => {
    if (!servicesList) return ['Servicio Principal', 'Cuidado Completo', 'Tratamiento VIP'];
    return servicesList
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [servicesList]);

  // Load sales from localStorage or seed initial data
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading sales from localStorage', e);
    }

    // Seed realistic initial daily records
    const today = new Date().toISOString().split('T')[0];
    const initial: SaleRecord[] = [];

    const defaultPrices = [450, 850, 300];
    const defaultServices = suggestedServices.length > 0 ? suggestedServices : ['Corte y Estilo VIP', 'Tratamiento Restaurador', 'Perfilado y Barba'];
    const defaultCollabs = suggestedCollaborators.length > 0 ? suggestedCollaborators : ['Carlos M.', 'Laura G.', 'Andrés P.'];
    const defaultClients = ['Mariana Soto', 'Carlos Mendoza', 'Dra. Sofía Valladares'];
    const defaultPaymentMethods = ['Efectivo', 'Tarjeta de Crédito / Débito', 'Transferencia'];

    for (let i = 0; i < 3; i++) {
      const price = defaultPrices[i % defaultPrices.length];
      const commPct = commissionDefault || 40;
      const commAmount = (price * commPct) / 100;
      const netGain = price - commAmount;

      initial.push({
        id: `sale-${i + 1}-${Date.now().toString(36)}`,
        fecha: today,
        colaborador: defaultCollabs[i % defaultCollabs.length] || 'Especialista 1',
        cliente: defaultClients[i % defaultClients.length],
        servicio: defaultServices[i % defaultServices.length] || 'Servicio de Atención',
        precioCobrado: price,
        metodoPago: defaultPaymentMethods[i % defaultPaymentMethods.length],
        comisionPorcentaje: commPct,
        comisionCalculada: commAmount,
        gananciaNeta: netGain,
        createdAt: new Date(Date.now() - (3 - i) * 3600 * 1000).toISOString(),
      });
    }

    return initial;
  });

  // Reload sales when businessId/storageKey changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSales(parsed);
          return;
        }
      }
      setSales([]);
    } catch (e) {
      console.warn('Error syncing sales on business change', e);
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sales));
    } catch (e) {
      console.error('Error saving sales to localStorage', e);
    }
  }, [sales, storageKey]);

  // Form State
  const [formFecha, setFormFecha] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formColaborador, setFormColaborador] = useState<string>('');
  const [formCliente, setFormCliente] = useState<string>('');
  const [formServicio, setFormServicio] = useState<string>('');
  const [formPrecio, setFormPrecio] = useState<string>('');
  const [formMetodoPago, setFormMetodoPago] = useState<string>('Efectivo');
  const [formComisionPct, setFormComisionPct] = useState<number>(commissionDefault || 40);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter State
  const [filterColaborador, setFilterColaborador] = useState<string>('all');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Calculations for dynamic preview in form
  const parsedPrice = parseFloat(formPrecio) || 0;
  const calculatedCommission = (parsedPrice * (formComisionPct || 0)) / 100;
  const calculatedNet = parsedPrice - calculatedCommission;

  // Handle submit new sale record
  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formColaborador.trim()) errors['colaborador'] = 'Ingresa el nombre del colaborador';
    if (!formCliente.trim()) errors['cliente'] = 'Ingresa el nombre del cliente';
    if (!formServicio.trim()) errors['servicio'] = 'Ingresa el servicio realizado';
    if (!formPrecio || parsedPrice <= 0) errors['precio'] = 'Ingresa un precio válido mayor a 0';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newRecord: SaleRecord = {
      id: `sale-${Date.now().toString(36)}`,
      fecha: formFecha,
      colaborador: formColaborador.trim(),
      cliente: formCliente.trim(),
      servicio: formServicio.trim(),
      precioCobrado: parsedPrice,
      metodoPago: formMetodoPago,
      comisionPorcentaje: formComisionPct,
      comisionCalculada: calculatedCommission,
      gananciaNeta: calculatedNet,
      createdAt: new Date().toISOString(),
    };

    setSales([newRecord, ...sales]);
    setFormCliente('');
    setFormServicio('');
    setFormPrecio('');
    setFormErrors({});
    showToast(`¡Venta registrada con éxito (${currencySymbol}${parsedPrice.toLocaleString()})!`);

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  // Delete sale
  const handleDeleteSale = (id: string) => {
    setSales(sales.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
    showToast('Registro de venta eliminado.');
  };

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (filterColaborador !== 'all' && s.colaborador.toLowerCase() !== filterColaborador.toLowerCase()) {
        return false;
      }
      if (filterFecha && s.fecha !== filterFecha) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const text = `${s.cliente} ${s.colaborador} ${s.servicio} ${s.metodoPago}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      return true;
    });
  }, [sales, filterColaborador, filterFecha, searchTerm]);

  // Metrics summary
  const totals = useMemo(() => {
    let totalSales = 0;
    let totalCommissions = 0;
    let totalNet = 0;

    filteredSales.forEach((s) => {
      totalSales += s.precioCobrado;
      totalCommissions += s.comisionCalculada;
      totalNet += s.gananciaNeta;
    });

    return {
      totalSales,
      totalCommissions,
      totalNet,
      count: filteredSales.length,
    };
  }, [filteredSales]);

  // Export to CSV
  const handleExportSalesCSV = () => {
    const headers = [
      'Fecha',
      'Colaborador',
      'Cliente',
      'Servicio Realizado',
      `Precio Cobrado (${currency})`,
      'Método de Pago',
      '% Comisión',
      `Comisión Colaborador (${currency})`,
      `Ganancia Neta Negocio (${currency})`,
    ];
    const rows = filteredSales.map((s) => [
      s.fecha,
      s.colaborador,
      s.cliente,
      s.servicio,
      s.precioCobrado.toFixed(2),
      s.metodoPago,
      `${s.comisionPorcentaje}%`,
      s.comisionCalculada.toFixed(2),
      s.gananciaNeta.toFixed(2),
    ]);
    downloadCSV(`${businessName.replace(/\s+/g, '_')}_Registro_Ventas_Cierre.csv`, headers, rows);
    showToast('Cierre de ventas exportado a CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500/50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Ventas Totales */}
        <div className="p-4.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ventas Totales Cobradas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {currencySymbol} {totals.totalSales.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
              {totals.count} servicio{totals.count === 1 ? '' : 's'} registrado{totals.count === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Card 2: Comisiones a Pagar */}
        <div className="p-4.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Comisiones a Pagar al Equipo
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-300 tracking-tight font-mono">
              {currencySymbol} {totals.totalCommissions.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Liquidación acumulada de colaboradores
            </p>
          </div>
        </div>

        {/* Card 3: Ingreso Neto del Negocio */}
        <div className="p-4.5 bg-gradient-to-br from-emerald-950/90 to-slate-900 text-white rounded-2xl border border-emerald-600/40 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Ingreso Neto del Negocio
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
              {currencySymbol} {totals.totalNet.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Margen neto tras deducir comisiones
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Entry Form for Daily Sales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Formulario de Registro Diario de Ventas y Comisiones
              </h3>
              <p className="text-xs text-slate-500">
                Registra los servicios atendidos hoy en <span className="font-semibold text-slate-800">{businessName}</span>
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Esquema: {moduloColaboradores.modelType}
          </span>
        </div>

        <form onSubmit={handleAddSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Fecha */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Fecha del Servicio *</span>
              </label>
              <input
                type="date"
                id="sale-input-fecha"
                value={formFecha}
                onChange={(e) => setFormFecha(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
                required
              />
            </div>

            {/* 2. Colaborador */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" />
                <span>Colaborador / Especialista *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sale-input-colaborador"
                  placeholder="Ej. Carlos M. o Laura"
                  list="colaboradores-list"
                  value={formColaborador}
                  onChange={(e) => setFormColaborador(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium ${
                    formErrors['colaborador']
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
                <datalist id="colaboradores-list">
                  {suggestedCollaborators.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>
              {formErrors['colaborador'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['colaborador']}
                </span>
              )}
            </div>

            {/* 3. Cliente */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Nombre del Cliente *</span>
              </label>
              <input
                type="text"
                id="sale-input-cliente"
                placeholder="Ej. Mariana Soto"
                value={formCliente}
                onChange={(e) => setFormCliente(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium ${
                  formErrors['cliente']
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
              {formErrors['cliente'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['cliente']}
                </span>
              )}
            </div>

            {/* 4. Servicio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                <span>Servicio Realizado *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sale-input-servicio"
                  placeholder="Ej. Corte VIP + Barba"
                  list="servicios-list"
                  value={formServicio}
                  onChange={(e) => setFormServicio(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium ${
                    formErrors['servicio']
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
                <datalist id="servicios-list">
                  {suggestedServices.map((svc, i) => (
                    <option key={i} value={svc} />
                  ))}
                </datalist>
              </div>
              {formErrors['servicio'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['servicio']}
                </span>
              )}
            </div>

            {/* 5. Precio Cobrado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                <span>Precio Cobrado ({currencySymbol}) *</span>
              </label>
              <input
                type="number"
                id="sale-input-precio"
                placeholder="Ej. 450"
                min="0"
                step="any"
                value={formPrecio}
                onChange={(e) => setFormPrecio(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-bold ${
                  formErrors['precio']
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
              {formErrors['precio'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['precio']}
                </span>
              )}
            </div>

            {/* 6. Método de Pago */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-slate-400" />
                <span>Método de Pago</span>
              </label>
              <select
                id="sale-input-metodo-pago"
                value={formMetodoPago}
                onChange={(e) => setFormMetodoPago(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium cursor-pointer"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia / Depósito">Transferencia / Depósito</option>
                <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                <option value="Billetera Digital / QR">Billetera Digital / QR</option>
              </select>
            </div>

            {/* 7. % Comisión */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calculator className="w-3 h-3 text-slate-400" />
                <span>% Comisión Colaborador</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="sale-input-comision-pct"
                  min="0"
                  max="100"
                  value={formComisionPct}
                  onChange={(e) => setFormComisionPct(Number(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-bold"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            {/* 8. Live Preview & Submit Button */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                id="btn-submit-sale-record"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Agregar al Cierre</span>
              </button>
            </div>
          </div>

          {/* Real-time Calculation Badge under form */}
          {parsedPrice > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                Cálculo instantáneo para este servicio:
              </span>
              <div className="flex items-center gap-4">
                <span className="text-slate-700">
                  Total Cobrado: <strong className="text-slate-900">{currencySymbol}{parsedPrice.toFixed(2)}</strong>
                </span>
                <span className="text-blue-700">
                  Comisión ({formComisionPct}%): <strong>{currencySymbol}{calculatedCommission.toFixed(2)}</strong>
                </span>
                <span className="text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                  Ganancia Neta: {currencySymbol}{calculatedNet.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Interactive Sales Table Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-sales-input"
              placeholder="Buscar cliente, especialista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>

          {/* Filter by Colaborador */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterColaborador}
              onChange={(e) => setFilterColaborador(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
            >
              <option value="all">Todos los colaboradores</option>
              {Array.from(new Set(sales.map((s) => s.colaborador))).map((collab, i) => (
                <option key={i} value={collab}>
                  {collab}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-export-sales-csv"
            onClick={handleExportSalesCSV}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Descargar Cierre (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Interactive Sales Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredSales.length === 0 ? (
          <div className="p-10 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No hay ventas registradas</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || filterColaborador !== 'all'
                ? 'No se encontraron registros con los filtros seleccionados.'
                : 'Utiliza el formulario de arriba para ingresar el primer servicio cobrado del día.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Colaborador</th>
                  <th className="py-3 px-4">Cliente / Servicio</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4 text-right">Precio Cobrado</th>
                  <th className="py-3 px-4 text-right">Comisión</th>
                  <th className="py-3 px-4 text-right">Ganancia Neta</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {sale.fecha}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {sale.colaborador.charAt(0).toUpperCase()}
                        </div>
                        <span>{sale.colaborador}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-800 text-xs">{sale.cliente}</div>
                      <div className="text-[11px] text-slate-500 truncate">{sale.servicio}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200">
                        {sale.metodoPago}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                      {currencySymbol} {sale.precioCobrado.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-700 font-semibold font-mono whitespace-nowrap">
                      <div className="text-xs">
                        {currencySymbol} {sale.comisionCalculada.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">{sale.comisionPorcentaje}%</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 font-mono whitespace-nowrap">
                      {currencySymbol} {sale.gananciaNeta.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {deleteConfirmId === sale.id ? (
                        <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                          <span className="text-[10px] text-rose-700 font-bold px-1">¿Borrar?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSale(sale.id)}
                            className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] font-bold text-slate-600 hover:bg-slate-200 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          id={`btn-delete-sale-${sale.id}`}
                          onClick={() => setDeleteConfirmId(sale.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este registro de venta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rules and Closing Advice Accordion / Box */}
      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Reglas de Liquidación y Políticas Clave ({businessName})</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
          {moduloColaboradores.paymentRules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-emerald-600 font-bold shrink-0">•</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
