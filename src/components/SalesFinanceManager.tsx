import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  UserPlus,
  MessageCircle,
  Clock,
  ChevronDown,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import { SaleRecord, EmployeeModule, CollaboratorItem, ClientRecord } from '../types';
import { downloadCSV } from '../utils/exportUtils';
import { formatAmount, parseAmount } from '../utils/formatUtils';
import { CollaboratorsModal } from './CollaboratorsModal';
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
  const salesStorageKey = useMemo(
    () => `crm_sales_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessId, businessName]
  );

  const collabsStorageKey = useMemo(
    () => `crm_collaborators_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessId, businessName]
  );

  const clientsStorageKey = useMemo(
    () => `crm_client_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessId, businessName]
  );

  // Helper to extract primary display name from a client
  const getClientDisplayName = (data: Record<string, any>): string => {
    for (const key of Object.keys(data)) {
      if (key.toLowerCase().includes('nombre') && data[key]) {
        return String(data[key]);
      }
    }
    const firstVal = Object.values(data).find((v) => v && String(v).trim().length > 0);
    return firstVal ? String(firstVal) : 'Cliente';
  };

  // Helper to extract phone/whatsapp from a client
  const getClientPhone = (data: Record<string, any>): string => {
    for (const key of Object.keys(data)) {
      const lower = key.toLowerCase();
      if ((lower.includes('whatsapp') || lower.includes('teléfono') || lower.includes('telefono') || lower.includes('celular')) && data[key]) {
        return String(data[key]);
      }
    }
    return '';
  };

  // 1. Registered Clients for Predictive Auto-complete
  const [registeredClients, setRegisteredClients] = useState<ClientRecord[]>([]);

  useEffect(() => {
    const syncRegisteredClients = () => {
      try {
        const saved = localStorage.getItem(clientsStorageKey) || localStorage.getItem(`crm_clients_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRegisteredClients(parsed);
            return;
          }
        }
        setRegisteredClients([]);
      } catch (e) {
        console.warn('Error reading clients for autocomplete', e);
      }
    };

    syncRegisteredClients();

    const handleUpdate = () => syncRegisteredClients();
    window.addEventListener('crm-data-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('crm-data-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [clientsStorageKey, businessId, businessName]);

  // 2. Collaborators State & Management
  const [collaborators, setCollaborators] = useState<CollaboratorItem[]>(() => {
    try {
      const saved = localStorage.getItem(collabsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading collaborators', e);
    }

    // Seed default collaborators
    const seeded: CollaboratorItem[] = [];
    const sampleNames = moduloColaboradores?.sampleClosingRows?.map((r) => r.colaborador) || ['Carlos M.', 'Laura G.', 'Andrés P.'];
    const uniqueNames = Array.from(new Set(sampleNames));

    uniqueNames.forEach((name, idx) => {
      seeded.push({
        id: `collab-init-${idx + 1}`,
        name: name,
        role: idx === 0 ? 'Especialista Principal' : 'Especialista',
        commissionDefault: commissionDefault || 40,
        active: true,
        createdAt: new Date().toISOString(),
      });
    });

    return seeded;
  });

  // Sync collaborators when business changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(collabsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCollaborators(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Error syncing collaborators', e);
    }
  }, [collabsStorageKey]);

  // Save collaborators
  const handleSaveCollaborators = (updated: CollaboratorItem[]) => {
    setCollaborators(updated);
    try {
      localStorage.setItem(collabsStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving collaborators', e);
    }
  };

  const [isCollabsModalOpen, setIsCollabsModalOpen] = useState(false);

  // Suggested services
  const suggestedServices = useMemo(() => {
    if (!servicesList) return ['Servicio Principal', 'Cuidado Completo', 'Tratamiento VIP'];
    return servicesList
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [servicesList]);

  // 3. Sales State
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(salesStorageKey);
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
    const defaultCollabNames = collaborators.map((c) => c.name);
    const defaultClients = ['Mariana Soto', 'Carlos Mendoza', 'Dra. Sofía Valladares'];
    const defaultPaymentMethods = ['Efectivo', 'Tarjeta de Crédito / Débito', 'Transferencia'];

    for (let i = 0; i < 3; i++) {
      const price = defaultPrices[i % defaultPrices.length];
      const commPct = commissionDefault || 40;
      const commAmount = (price * commPct) / 100;
      const netGain = price - commAmount;
      // Let the 3rd sample have a pending balance of 100.00 to showcase debtor management
      const pending = i === 2 ? 100 : 0;
      const paid = price - pending;

      initial.push({
        id: `sale-${i + 1}-${Date.now().toString(36)}`,
        fecha: today,
        colaborador: defaultCollabNames[i % defaultCollabNames.length] || 'Carlos M.',
        cliente: defaultClients[i % defaultClients.length],
        clientePhone: '+504 9988-7766',
        servicio: defaultServices[i % defaultServices.length] || 'Servicio de Atención',
        precioCobrado: price,
        montoPagado: paid,
        montoPendiente: pending,
        metodoPago: defaultPaymentMethods[i % defaultPaymentMethods.length],
        comisionPorcentaje: commPct,
        comisionCalculada: commAmount,
        gananciaNeta: netGain,
        createdAt: new Date(Date.now() - (3 - i) * 3600 * 1000).toISOString(),
      });
    }

    return initial;
  });

  // Reload sales when businessId/salesStorageKey changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(salesStorageKey);
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
  }, [salesStorageKey]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(salesStorageKey, JSON.stringify(sales));
    } catch (e) {
      console.error('Error saving sales to localStorage', e);
    }
  }, [sales, salesStorageKey]);

  // Form State
  const [formFecha, setFormFecha] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formColaborador, setFormColaborador] = useState<string>('');
  const [formCliente, setFormCliente] = useState<string>('');
  const [formClientePhone, setFormClientePhone] = useState<string>('');
  const [formServicio, setFormServicio] = useState<string>('');
  const [formPrecio, setFormPrecio] = useState<string>('');
  const [formMontoPendiente, setFormMontoPendiente] = useState<string>('0');
  const [formMetodoPago, setFormMetodoPago] = useState<string>('Efectivo');
  const [formComisionPct, setFormComisionPct] = useState<number>(commissionDefault || 40);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Predictive Auto-complete states
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [isCollabDropdownOpen, setIsCollabDropdownOpen] = useState(false);

  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const collabDropdownRef = useRef<HTMLDivElement>(null);

  // Filter State
  const [filterColaborador, setFilterColaborador] = useState<string>('all');
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [filterDebtorOnly, setFilterDebtorOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
      if (collabDropdownRef.current && !collabDropdownRef.current.contains(event.target as Node)) {
        setIsCollabDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Client Predictive Options
  const filteredClientSuggestions = useMemo(() => {
    const term = formCliente.trim().toLowerCase();
    return registeredClients.filter((c) => {
      const name = getClientDisplayName(c.data).toLowerCase();
      const phone = getClientPhone(c.data).toLowerCase();
      const allText = Object.values(c.data).join(' ').toLowerCase();
      if (!term) return true;
      return name.includes(term) || phone.includes(term) || allText.includes(term);
    }).slice(0, 8);
  }, [formCliente, registeredClients]);

  // Filtered Collaborators Predictive Options
  const filteredCollabSuggestions = useMemo(() => {
    const term = formColaborador.trim().toLowerCase();
    const activeCollabs = collaborators.filter((c) => c.active);
    if (!term) return activeCollabs.slice(0, 8);
    return activeCollabs.filter((c) => 
      c.name.toLowerCase().includes(term) || c.role.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [formColaborador, collaborators]);

  // Dynamic calculations in form with exact math
  const parsedPrice = parseAmount(formPrecio) || parseFloat(formPrecio) || 0;
  const parsedPending = parseAmount(formMontoPendiente) || parseFloat(formMontoPendiente) || 0;
  const parsedPaid = Math.max(0, Math.round((parsedPrice - parsedPending) * 100) / 100);
  const calculatedCommission = Math.round(((parsedPrice * (formComisionPct || 0)) / 100) * 100) / 100;
  const calculatedNet = Math.round((parsedPrice - calculatedCommission) * 100) / 100;

  // Handle Client Selection from Auto-complete
  const handleSelectClient = (client: ClientRecord) => {
    const name = getClientDisplayName(client.data);
    const phone = getClientPhone(client.data);
    setFormCliente(name);
    if (phone) setFormClientePhone(phone);
    setIsClientDropdownOpen(false);
  };

  // Handle Collaborator Selection from Auto-complete
  const handleSelectCollaborator = (collab: CollaboratorItem) => {
    setFormColaborador(collab.name);
    if (collab.commissionDefault !== undefined) {
      setFormComisionPct(collab.commissionDefault);
    }
    setIsCollabDropdownOpen(false);
  };

  // Handle submit new sale record
  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formColaborador.trim()) errors['colaborador'] = 'Ingresa el nombre del colaborador';
    if (!formCliente.trim()) errors['cliente'] = 'Ingresa el nombre del cliente';
    if (!formServicio.trim()) errors['servicio'] = 'Ingresa el servicio realizado';
    if (!formPrecio || parsedPrice <= 0) errors['precio'] = 'Ingresa un precio válido mayor a 0';
    if (parsedPending > parsedPrice) errors['pendiente'] = 'El saldo pendiente no puede ser mayor al precio del servicio';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newRecord: SaleRecord = {
      id: `sale-${Date.now().toString(36)}`,
      fecha: formFecha,
      colaborador: formColaborador.trim(),
      cliente: formCliente.trim(),
      clientePhone: formClientePhone.trim() || undefined,
      servicio: formServicio.trim(),
      precioCobrado: parsedPrice,
      montoPagado: parsedPaid,
      montoPendiente: parsedPending,
      metodoPago: formMetodoPago,
      comisionPorcentaje: formComisionPct,
      comisionCalculada: calculatedCommission,
      gananciaNeta: calculatedNet,
      createdAt: new Date().toISOString(),
    };

    const updatedSales = [newRecord, ...sales];
    setSales(updatedSales);
    try {
      localStorage.setItem(salesStorageKey, JSON.stringify(updatedSales));
      window.dispatchEvent(new CustomEvent('crm-data-updated'));
    } catch (e) {
      console.error('Error saving sales', e);
    }

    setFormCliente('');
    setFormClientePhone('');
    setFormServicio('');
    setFormPrecio('');
    setFormMontoPendiente('0');
    setFormErrors({});
    showToast(`¡Venta registrada: Pagado ${formatAmount(parsedPaid)} ${parsedPending > 0 ? `(Debe ${formatAmount(parsedPending)})` : ''}!`);

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  // Settle Debt Action for a sale
  const handleSettleDebtSale = (id: string) => {
    const updated = sales.map((s) =>
      s.id === id
        ? {
            ...s,
            montoPendiente: 0,
            montoPagado: s.precioCobrado,
            notas: (s.notas ? s.notas + ' | ' : '') + `Saldado el ${new Date().toLocaleDateString()}`,
          }
        : s
    );
    setSales(updated);
    try {
      localStorage.setItem(salesStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('crm-data-updated'));
    } catch (e) {
      console.error('Error settling debt in storage', e);
    }
    showToast('¡Saldo pendiente marcado como pagado exitosamente!');
  };

  // Delete sale
  const handleDeleteSale = (id: string) => {
    const updated = sales.filter((s) => s.id !== id);
    setSales(updated);
    try {
      localStorage.setItem(salesStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('crm-data-updated'));
    } catch (e) {
      console.error('Error deleting sale in storage', e);
    }
    setDeleteConfirmId(null);
    showToast('Registro de venta eliminado.');
  };

  // Filtered sales list
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (filterColaborador !== 'all' && s.colaborador.toLowerCase() !== filterColaborador.toLowerCase()) {
        return false;
      }
      if (filterFecha && s.fecha !== filterFecha) {
        return false;
      }
      if (filterDebtorOnly && (s.montoPendiente || 0) <= 0) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const text = `${s.cliente} ${s.colaborador} ${s.servicio} ${s.metodoPago}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      return true;
    });
  }, [sales, filterColaborador, filterFecha, filterDebtorOnly, searchTerm]);

  // Outstanding Debtors List (Sales with pending balance > 0)
  const activeDebtors = useMemo(() => {
    return sales.filter((s) => (s.montoPendiente || 0) > 0);
  }, [sales]);

  const totalPendingDebtAll = useMemo(() => {
    return activeDebtors.reduce((acc, curr) => acc + (curr.montoPendiente || 0), 0);
  }, [activeDebtors]);

  // Metrics summary
  const totals = useMemo(() => {
    let totalSales = 0;
    let totalCommissions = 0;
    let totalNet = 0;
    let totalPending = 0;

    filteredSales.forEach((s) => {
      totalSales += s.precioCobrado || 0;
      totalCommissions += s.comisionCalculada || 0;
      totalNet += s.gananciaNeta || 0;
      totalPending += s.montoPendiente || 0;
    });

    return {
      totalSales,
      totalCommissions,
      totalNet,
      totalPending,
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
      'Precio Total',
      'Monto Pagado',
      'Saldo Pendiente',
      'Método de Pago',
      '% Comisión',
      'Comisión Colaborador',
      'Ganancia Neta Negocio',
    ];
    const rows = filteredSales.map((s) => [
      s.fecha,
      s.colaborador,
      s.cliente,
      s.servicio,
      formatAmount(s.precioCobrado),
      formatAmount(s.montoPagado ?? s.precioCobrado),
      formatAmount(s.montoPendiente ?? 0),
      s.metodoPago,
      `${s.comisionPorcentaje}%`,
      formatAmount(s.comisionCalculada),
      formatAmount(s.gananciaNeta),
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

      {/* Collaborators Management Modal */}
      <CollaboratorsModal
        isOpen={isCollabsModalOpen}
        onClose={() => setIsCollabsModalOpen(false)}
        collaborators={collaborators}
        onSaveCollaborators={handleSaveCollaborators}
        businessName={businessName}
        defaultCommission={commissionDefault}
      />

      {/* Header with Quick Management Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1322] text-white p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Gestión de Equipo & Colaboradores
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {collaborators.filter((c) => c.active).length} activos
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Personal asignable con reparto automático de comisiones para <strong className="text-slate-200">{businessName}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-manage-collaborators"
            onClick={() => setIsCollabsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/40 border border-emerald-400/40 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="Agregar, editar o eliminar colaboradores del negocio"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>👥 Administrar Colaboradores</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards with Standard 1,250.00 Format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Totales */}
        <div className="p-4.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ventas Totales Cobradas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {formatAmount(totals.totalSales)}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
              {totals.count} servicio{totals.count === 1 ? '' : 's'} registrado{totals.count === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Card 2: Comisiones a Pagar */}
        <div className="p-4.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Comisiones Colaboradores
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-300 tracking-tight font-mono">
              {formatAmount(totals.totalCommissions)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Liquidación acumulada de equipo
            </p>
          </div>
        </div>

        {/* Card 3: Ingreso Neto Negocio */}
        <div className="p-4.5 bg-gradient-to-br from-emerald-950/90 to-slate-900 text-white rounded-2xl border border-emerald-600/40 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Ingreso Neto del Negocio
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
              {formatAmount(totals.totalNet)}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Margen neto tras comisiones
            </p>
          </div>
        </div>

        {/* Card 4: Saldos Pendientes / Deudas Totales */}
        <div
          className={`p-4.5 rounded-2xl border shadow-md flex flex-col justify-between transition-colors ${
            totalPendingDebtAll > 0
              ? 'bg-gradient-to-br from-rose-950/90 to-slate-900 border-rose-600/50 text-white'
              : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                totalPendingDebtAll > 0 ? 'text-rose-300' : 'text-slate-400'
              }`}
            >
              Saldos Pendientes (Deudores)
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                totalPendingDebtAll > 0 ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
                totalPendingDebtAll > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {formatAmount(totalPendingDebtAll)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeDebtors.length} cuenta{activeDebtors.length === 1 ? '' : 's'} por cobrar
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Entry Form for Daily Sales with Predictive Auto-complete & Debt Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Formulario de Registro Diario de Ventas, Comisiones & Saldos
              </h3>
              <p className="text-xs text-slate-500">
                Búsqueda predictiva con autocompletado de clientes registrados y colaboradores activos.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Esquema: {moduloColaboradores.modelType}
          </span>
        </div>

        <form onSubmit={handleAddSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
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

            {/* 2. Colaborador / Especialista (Predictive Auto-complete) */}
            <div className="relative" ref={collabDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-slate-400" />
                  <span>Colaborador / Especialista *</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Escribe o selecciona</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sale-input-colaborador"
                  placeholder="Escribe la primera letra..."
                  value={formColaborador}
                  onFocus={() => setIsCollabDropdownOpen(true)}
                  onChange={(e) => {
                    setFormColaborador(e.target.value);
                    setIsCollabDropdownOpen(true);
                  }}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium ${
                    formErrors['colaborador']
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setIsCollabDropdownOpen(!isCollabDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Predictive Dropdown for Collaborators */}
              {isCollabDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                  <div className="p-1.5 bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 flex justify-between items-center">
                    <span>Colaboradores del Negocio</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCollabDropdownOpen(false);
                        setIsCollabsModalOpen(true);
                      }}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      + Gestionar
                    </button>
                  </div>
                  {filteredCollabSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      No hay coincidencias. Se guardará como nuevo colaborador.
                    </div>
                  ) : (
                    filteredCollabSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCollaborator(c)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.role}</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {c.commissionDefault}% comisión
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {formErrors['colaborador'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['colaborador']}
                </span>
              )}
            </div>

            {/* 3. Nombre del Cliente (Predictive Auto-complete from Registered Clients DB) */}
            <div className="relative" ref={clientDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>Nombre del Cliente *</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Autocompleta desde clientes</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sale-input-cliente"
                  placeholder="Escribe la primera letra..."
                  value={formCliente}
                  onFocus={() => {
                    if (registeredClients.length > 0) setIsClientDropdownOpen(true);
                  }}
                  onChange={(e) => {
                    setFormCliente(e.target.value);
                    setIsClientDropdownOpen(true);
                  }}
                  className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium ${
                    formErrors['cliente']
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Predictive Dropdown for Registered Clients */}
              {isClientDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                  <div className="p-1.5 bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 flex justify-between items-center">
                    <span>Clientes Registrados ({registeredClients.length})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Haz clic para autocompletar</span>
                  </div>
                  {filteredClientSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      {formCliente.trim() ? 'No se encontraron clientes registrados con ese nombre.' : 'Escribe para buscar clientes.'}
                    </div>
                  ) : (
                    filteredClientSuggestions.map((cli) => {
                      const name = Object.values(cli.data)[0] || 'Cliente';
                      const phone = cli.data['Teléfono / WhatsApp'] || cli.data['Teléfono'] || '';
                      return (
                        <button
                          key={cli.id}
                          type="button"
                          onClick={() => handleSelectClient(cli)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 flex items-center justify-between border-b border-slate-50 last:border-0 cursor-pointer transition-colors"
                        >
                          <div className="font-bold text-slate-900">{name}</div>
                          {phone && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {phone}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {formErrors['cliente'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['cliente']}
                </span>
              )}
            </div>

            {/* 4. Servicio Realizado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                <span>Servicio Realizado *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sale-input-servicio"
                  placeholder="Ej. Corte VIP + Tratamiento"
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

            {/* 5. Precio Cobrado / Total */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                <span>Precio Total del Servicio *</span>
              </label>
              <input
                type="number"
                id="sale-input-precio"
                placeholder="Ej. 300.00"
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

            {/* 6. Monto Pendiente de Pago (Gestión de Deudores) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-rose-700">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>Monto Pendiente de Pago</span>
                </span>
                <span className="text-[10px] text-slate-400">Si pagó parcial o debe</span>
              </label>
              <input
                type="number"
                id="sale-input-monto-pendiente"
                placeholder="0.00 si pagó completo"
                min="0"
                max={parsedPrice || undefined}
                step="any"
                value={formMontoPendiente}
                onChange={(e) => setFormMontoPendiente(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 font-bold ${
                  parsedPending > 0 ? 'border-rose-300 text-rose-700 bg-rose-50/50' : 'border-slate-200'
                }`}
              />
              {formErrors['pendiente'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['pendiente']}
                </span>
              )}
              {parsedPending > 0 && parsedPrice > 0 && (
                <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">
                  Pagó hoy: {formatAmount(parsedPaid)} | Debe: {formatAmount(parsedPending)}
                </span>
              )}
            </div>

            {/* 7. Método de Pago */}
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

            {/* 8. % Comisión Colaborador */}
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

            {/* Dynamic Calculation Output Preview Card */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex flex-col justify-center space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-medium">Cobrado Hoy (Efectivo/Pago):</span>
                <span className="font-extrabold text-emerald-400 font-mono text-xs">
                  {formatAmount(parsedPaid)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-medium">Saldo Pendiente (Adeudado):</span>
                <span className={`font-extrabold font-mono text-xs ${parsedPending > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                  {formatAmount(parsedPending)}
                </span>
              </div>
              <div className="border-t border-slate-800 pt-1 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Comisión Especialista ({formComisionPct}%):</span>
                <span className="font-bold text-blue-300 font-mono">
                  {formatAmount(calculatedCommission)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Ganancia Neta Local:</span>
                <span className="font-bold text-emerald-300 font-mono">
                  {formatAmount(calculatedNet)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="btn-submit-daily-sale"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Guardar Venta del Día</span>
            </button>
          </div>
        </form>
      </div>

      {/* Highlighted Block: Clientes Deudores / Saldos Pendientes del Día */}
      {activeDebtors.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-2xl border border-rose-700/60 shadow-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Clientes Deudores / Saldos Pendientes
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Total Adeudado: {formatAmount(totalPendingDebtAll)}
                  </span>
                </h4>
                <p className="text-[11px] text-rose-300/80">
                  Cuentas con cobros pendientes registradas en {businessName}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilterDebtorOnly(!filterDebtorOnly)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                filterDebtorOnly
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-rose-950/80 text-rose-200 border-rose-700 hover:bg-rose-900'
              }`}
            >
              {filterDebtorOnly ? 'Mostrar Todas las Ventas' : 'Filtrar Solo Deudores'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {activeDebtors.map((debtor) => {
              const cleanPhone = debtor.clientePhone ? debtor.clientePhone.replace(/[^0-9]/g, '') : '';
              const waMsg = encodeURIComponent(
                `Hola ${debtor.cliente}, te saludamos de ${businessName}. Te recordamos amablemente tu saldo pendiente de ${formatAmount(debtor.montoPendiente)} por tu servicio de "${debtor.servicio}" del día ${debtor.fecha}. ¡Muchas gracias!`
              );
              return (
                <div
                  key={debtor.id}
                  className="bg-slate-900/90 border border-rose-700/50 rounded-xl p-3.5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{debtor.cliente}</span>
                      <span className="text-rose-400 font-mono font-extrabold text-xs bg-rose-950 px-2 py-0.5 rounded border border-rose-700">
                        Debe: {formatAmount(debtor.montoPendiente)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      <span>{debtor.servicio}</span>
                      <span className="text-slate-500"> • {debtor.fecha}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Atendido por: <strong className="text-slate-200">{debtor.colaborador}</strong> (Precio Total: {formatAmount(debtor.precioCobrado)})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 px-2 rounded-lg transition-colors"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Cobrar WhatsApp</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSettleDebtSale(debtor.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 py-1.5 px-2 rounded-lg transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Saldar Pago</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Sales */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Search text */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-sales"
              placeholder="Buscar cliente, servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
            />
          </div>

          {/* Filter Colaborador */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              id="filter-select-colaborador"
              value={filterColaborador}
              onChange={(e) => setFilterColaborador(e.target.value)}
              className="text-xs bg-transparent border-0 focus:outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Todos los Colaboradores</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Fecha */}
          <input
            type="date"
            id="filter-input-fecha"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
            title="Filtrar por fecha específica"
          />

          {(filterFecha || filterColaborador !== 'all' || searchTerm || filterDebtorOnly) && (
            <button
              onClick={() => {
                setFilterFecha('');
                setFilterColaborador('all');
                setSearchTerm('');
                setFilterDebtorOnly(false);
              }}
              className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* CSV Export Button */}
        <button
          type="button"
          id="btn-export-sales-csv"
          onClick={handleExportSalesCSV}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
          title="Descargar reporte de cierre en formato CSV para Google Sheets"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Exportar Cierre (.CSV)</span>
        </button>
      </div>

      {/* Interactive Sales Records Table with Standard Numbers (1,250.00) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">No hay ventas que coincidan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || filterFecha || filterColaborador !== 'all' || filterDebtorOnly
                ? 'No se encontraron registros con los filtros seleccionados.'
                : 'Aún no has ingresado ventas para esta empresa. Usa el formulario de arriba para registrar los servicios de hoy.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Colaborador</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Servicio</th>
                  <th className="py-3.5 px-4 text-right">Precio Total</th>
                  <th className="py-3.5 px-4 text-right">Saldo Pendiente</th>
                  <th className="py-3.5 px-4 text-right">Comisión (%)</th>
                  <th className="py-3.5 px-4 text-right">Neto Negocio</th>
                  <th className="py-3.5 px-4">Pago</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSales.map((sale) => {
                  const isDebtor = (sale.montoPendiente || 0) > 0;
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {sale.fecha}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {sale.colaborador}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {sale.cliente}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {sale.servicio}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatAmount(sale.precioCobrado)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {isDebtor ? (
                          <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                            {formatAmount(sale.montoPendiente)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-normal">
                            0.00
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-blue-700 font-semibold">
                        {formatAmount(sale.comisionCalculada)} ({sale.comisionPorcentaje}%)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                        {formatAmount(sale.gananciaNeta)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {sale.metodoPago}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDebtor && (
                            <button
                              type="button"
                              onClick={() => handleSettleDebtSale(sale.id)}
                              className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded transition-colors"
                              title="Marcar saldo pendiente como pagado"
                            >
                              Saldar
                            </button>
                          )}

                          {deleteConfirmId === sale.id ? (
                            <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                              <span className="text-[10px] text-rose-700 font-bold px-1">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteSale(sale.id)}
                                className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-[10px] font-bold text-slate-600 hover:bg-slate-200 px-1.5 py-0.5 rounded"
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
