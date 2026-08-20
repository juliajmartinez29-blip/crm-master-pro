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
  Receipt,
  MessageCircle,
  Building2,
  Wallet,
  Clock,
  ChevronDown,
  ShoppingBag,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  X,
  Activity,
  UserCheck,
  BarChart3,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SaleRecord, ExpenseRecord, ClientRecord } from '../types';
import { downloadCSV } from '../utils/exportUtils';
import { formatAmount, parseAmount } from '../utils/formatUtils';
import confetti from 'canvas-confetti';

interface SalesFinanceManagerProps {
  businessId: string;
  businessName: string;
  currency: string;
  currencySymbol: string;
  servicesList?: string;
}

export const SalesFinanceManager: React.FC<SalesFinanceManagerProps> = ({
  businessId,
  businessName,
  currency,
  currencySymbol = '$',
  servicesList = '',
}) => {
  const salesStorageKey = useMemo(
    () => `crm_sales_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessId, businessName]
  );

  const expensesStorageKey = useMemo(
    () => `crm_expenses_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessId, businessName]
  );

  const clientsStorageKey = useMemo(
    () => `crm_client_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessId, businessName]
  );

  // Helper to extract primary display name from client data
  const getClientDisplayName = (data: Record<string, any>): string => {
    for (const key of Object.keys(data)) {
      if (key.toLowerCase().includes('nombre') && data[key]) {
        return String(data[key]);
      }
    }
    const firstVal = Object.values(data).find((v) => v && String(v).trim().length > 0);
    return firstVal ? String(firstVal) : 'Cliente';
  };

  // Helper to extract phone/whatsapp from client data
  const getClientPhone = (data: Record<string, any>): string => {
    for (const key of Object.keys(data)) {
      const lower = key.toLowerCase();
      if (
        (lower.includes('whatsapp') ||
          lower.includes('teléfono') ||
          lower.includes('telefono') ||
          lower.includes('celular')) &&
        data[key]
      ) {
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
        const saved =
          localStorage.getItem(clientsStorageKey) ||
          localStorage.getItem(
            `crm_clients_db_${businessId || businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
          );
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

  // Suggested services
  const suggestedServices = useMemo(() => {
    if (!servicesList) return ['Corte y Estilo', 'Tratamiento Especializado', 'Consulta General'];
    return servicesList
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [servicesList]);

  // 2. Sales State
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

    const today = new Date().toISOString().split('T')[0];
    const initial: SaleRecord[] = [
      {
        id: `sale-1-${Date.now().toString(36)}`,
        fecha: today,
        cliente: 'Mariana Soto',
        clientePhone: '+504 9988-7766',
        servicio: 'Corte Degradado & Estilo',
        colaborador: 'Atención General',
        precioCobrado: 450,
        montoPagado: 450,
        montoPendiente: 0,
        metodoPago: 'Efectivo',
        createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
      },
      {
        id: `sale-2-${Date.now().toString(36)}`,
        fecha: today,
        cliente: 'Carlos Mendoza',
        clientePhone: '+504 9876-5432',
        servicio: 'Tratamiento Restaurador',
        colaborador: 'Especialista',
        precioCobrado: 850,
        montoPagado: 850,
        montoPendiente: 0,
        metodoPago: 'Tarjeta de Crédito / Débito',
        createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: `sale-3-${Date.now().toString(36)}`,
        fecha: today,
        cliente: 'Dra. Sofía Valladares',
        clientePhone: '+504 9911-2233',
        servicio: 'Servicio Completo Premium',
        colaborador: 'Atención General',
        precioCobrado: 2000,
        montoPagado: 1500,
        montoPendiente: 500,
        metodoPago: 'Transferencia',
        notas: 'Abonó L 1,500.00 y adeuda saldo restante',
        createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
      },
    ];

    return initial;
  });

  // 3. Expenses & Debts State (Cuentas por Pagar del Negocio)
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem(expensesStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading expenses from localStorage', e);
    }

    const today = new Date().toISOString().split('T')[0];
    const initialExpenses: ExpenseRecord[] = [
      {
        id: `exp-1-${Date.now().toString(36)}`,
        fecha: today,
        lugarProveedor: 'Distribuidora Central de Cosméticos',
        descripcion: 'Compra de champús, acondicionadores y tintes',
        categoria: 'Insumos & Productos',
        frecuencia: 'Semanal',
        estado: 'Pagado',
        monto: 1200,
        createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      },
      {
        id: `exp-2-${Date.now().toString(36)}`,
        fecha: today,
        lugarProveedor: 'Propietario del Local Comercial',
        descripcion: 'Alquiler mensual del local',
        categoria: 'Alquiler / Renta',
        frecuencia: 'Mensual',
        estado: 'Pendiente por Pagar',
        monto: 3500,
        notas: 'Vencimiento el día 30 del mes',
        createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
      {
        id: `exp-3-${Date.now().toString(36)}`,
        fecha: today,
        lugarProveedor: 'Empresa de Energía Eléctrica',
        descripcion: 'Recibo mensual de energía',
        categoria: 'Servicios Básicos (Luz/Agua/Net)',
        frecuencia: 'Mensual',
        estado: 'Pagado',
        monto: 650,
        createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
    ];

    return initialExpenses;
  });

  // Reload sales & expenses on businessId change
  useEffect(() => {
    try {
      const savedSales = localStorage.getItem(salesStorageKey);
      if (savedSales) {
        const parsed = JSON.parse(savedSales);
        if (Array.isArray(parsed)) setSales(parsed);
      } else {
        setSales([]);
      }
    } catch {}

    try {
      const savedExp = localStorage.getItem(expensesStorageKey);
      if (savedExp) {
        const parsed = JSON.parse(savedExp);
        if (Array.isArray(parsed)) setExpenses(parsed);
      } else {
        setExpenses([]);
      }
    } catch {}
  }, [salesStorageKey, expensesStorageKey]);

  // Persist sales
  useEffect(() => {
    try {
      localStorage.setItem(salesStorageKey, JSON.stringify(sales));
    } catch (e) {
      console.error('Error saving sales to localStorage', e);
    }
  }, [sales, salesStorageKey]);

  // Persist expenses
  useEffect(() => {
    try {
      localStorage.setItem(expensesStorageKey, JSON.stringify(expenses));
    } catch (e) {
      console.error('Error saving expenses to localStorage', e);
    }
  }, [expenses, expensesStorageKey]);

  // Sales Form State
  const [formFecha, setFormFecha] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formCliente, setFormCliente] = useState<string>('');
  const [formClientePhone, setFormClientePhone] = useState<string>('');
  const [formServicio, setFormServicio] = useState<string>('');
  const [formColaborador, setFormColaborador] = useState<string>('');
  const [formPrecio, setFormPrecio] = useState<string>('');
  const [formMontoPendiente, setFormMontoPendiente] = useState<string>('0');
  const [formMetodoPago, setFormMetodoPago] = useState<string>('Efectivo');
  const [formNotas, setFormNotas] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Predictive Auto-complete states for clients
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Sales Filters State
  const [filterFecha, setFilterFecha] = useState<string>('');
  const [filterDebtorOnly, setFilterDebtorOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Expenses Form State
  const [expFecha, setExpFecha] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expProveedor, setExpProveedor] = useState<string>('');
  const [expDescripcion, setExpDescripcion] = useState<string>('');
  const [expCategoria, setExpCategoria] = useState<string>('Insumos & Productos');
  const [expFrecuencia, setExpFrecuencia] = useState<'Sin Frecuencia' | 'Puntual / Diario' | 'Semanal' | 'Mensual' | 'Anual'>('Sin Frecuencia');
  const [expEstado, setExpEstado] = useState<'Pagado' | 'Pendiente por Pagar'>('Pagado');
  const [expMonto, setExpMonto] = useState<string>('');
  const [expNotas, setExpNotas] = useState<string>('');
  const [expErrors, setExpErrors] = useState<Record<string, string>>({});
  const [filterExpCategory, setFilterExpCategory] = useState<string>('all');
  const [filterExpDebtsOnly, setFilterExpDebtsOnly] = useState<boolean>(false);

  // Expense Edit Modal State
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [editExpFecha, setEditExpFecha] = useState<string>('');
  const [editExpProveedor, setEditExpProveedor] = useState<string>('');
  const [editExpDescripcion, setEditExpDescripcion] = useState<string>('');
  const [editExpCategoria, setEditExpCategoria] = useState<string>('Insumos & Productos');
  const [editExpFrecuencia, setEditExpFrecuencia] = useState<'Sin Frecuencia' | 'Puntual / Diario' | 'Semanal' | 'Mensual' | 'Anual'>('Sin Frecuencia');
  const [editExpEstado, setEditExpEstado] = useState<'Pagado' | 'Pendiente por Pagar'>('Pagado');
  const [editExpMonto, setEditExpMonto] = useState<string>('');
  const [editExpNotas, setEditExpNotas] = useState<string>('');
  const [editExpErrors, setEditExpErrors] = useState<Record<string, string>>({});

  // Client Movement Time Period View State ('hoy' | 'semana' | 'mes' | 'anio')
  const [movementPeriod, setMovementPeriod] = useState<'hoy' | 'semana' | 'mes' | 'anio'>('hoy');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Client Predictive Options
  const filteredClientSuggestions = useMemo(() => {
    const term = formCliente.trim().toLowerCase();
    return registeredClients
      .filter((c) => {
        const name = getClientDisplayName(c.data).toLowerCase();
        const phone = getClientPhone(c.data).toLowerCase();
        const allText = Object.values(c.data).join(' ').toLowerCase();
        if (!term) return true;
        return name.includes(term) || phone.includes(term) || allText.includes(term);
      })
      .slice(0, 8);
  }, [formCliente, registeredClients]);

  // Clean mathematical calculation for sales (Precio Total, Pagado Hoy, Saldo Pendiente)
  const parsedPrice = parseAmount(formPrecio) || parseFloat(formPrecio) || 0;
  const parsedPending = parseAmount(formMontoPendiente) || parseFloat(formMontoPendiente) || 0;
  const parsedPaid = Math.max(0, Math.round((parsedPrice - parsedPending) * 100) / 100);

  // Handle Client Selection from Auto-complete
  const handleSelectClient = (client: ClientRecord) => {
    const name = getClientDisplayName(client.data);
    const phone = getClientPhone(client.data);
    setFormCliente(name);
    if (phone) setFormClientePhone(phone);
    setIsClientDropdownOpen(false);
  };

  // Submit new sale
  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formCliente.trim()) errors['cliente'] = 'Ingresa el nombre del cliente';
    if (!formServicio.trim()) errors['servicio'] = 'Ingresa el servicio realizado';
    if (!formPrecio || parsedPrice <= 0) errors['precio'] = 'Ingresa un precio válido mayor a 0';
    if (parsedPending > parsedPrice)
      errors['pendiente'] = 'El saldo pendiente no puede ser mayor al precio del servicio';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newRecord: SaleRecord = {
      id: `sale-${Date.now().toString(36)}`,
      fecha: formFecha,
      cliente: formCliente.trim(),
      clientePhone: formClientePhone.trim() || undefined,
      servicio: formServicio.trim(),
      colaborador: formColaborador.trim() || 'Atención General',
      precioCobrado: parsedPrice,
      montoPagado: parsedPaid,
      montoPendiente: parsedPending,
      metodoPago: formMetodoPago,
      notas: formNotas.trim() || undefined,
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
    setFormNotas('');
    setFormErrors({});
    showToast(
      `¡Venta guardada: Pagado ${formatAmount(parsedPaid)} ${
        parsedPending > 0 ? `(Debe ${formatAmount(parsedPending)})` : ''
      }!`
    );

    confetti({
      particleCount: 30,
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
      console.error('Error deleting sale', e);
    }
    setDeleteConfirmId(null);
    showToast('Registro de venta eliminado.');
  };

  // Submit new expense / debt
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedExpAmount = parseAmount(expMonto) || parseFloat(expMonto) || 0;
    const errors: Record<string, string> = {};
    if (!expProveedor.trim()) errors['proveedor'] = 'Ingresa el lugar o proveedor';
    if (!expDescripcion.trim()) errors['descripcion'] = 'Ingresa la descripción del gasto o deuda';
    if (!expMonto || parsedExpAmount <= 0) errors['monto'] = 'Ingresa un monto válido mayor a 0';

    if (Object.keys(errors).length > 0) {
      setExpErrors(errors);
      return;
    }

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now().toString(36)}`,
      fecha: expFecha,
      lugarProveedor: expProveedor.trim(),
      descripcion: expDescripcion.trim(),
      categoria: expCategoria,
      frecuencia: expFrecuencia,
      estado: expEstado,
      monto: parsedExpAmount,
      notas: expNotas.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    try {
      localStorage.setItem(expensesStorageKey, JSON.stringify(updatedExpenses));
      window.dispatchEvent(new CustomEvent('crm-data-updated'));
    } catch (e) {
      console.error('Error saving expenses', e);
    }

    setExpProveedor('');
    setExpDescripcion('');
    setExpMonto('');
    setExpNotas('');
    setExpErrors({});
    showToast(`¡Gasto / Deuda de ${formatAmount(parsedExpAmount)} registrado con éxito!`);
  };

  // Settle Expense Debt (Mark as Paid)
  const handleSettleExpense = (id: string) => {
    const updated = expenses.map((e) =>
      e.id === id
        ? {
            ...e,
            estado: 'Pagado' as const,
            notas: (e.notas ? e.notas + ' | ' : '') + `Pagado el ${new Date().toLocaleDateString()}`,
          }
        : e
    );
    setExpenses(updated);
    try {
      localStorage.setItem(expensesStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('crm-data-updated'));
    } catch (e) {
      console.error('Error settling expense', e);
    }
    showToast('¡Deuda marcada como pagada!');
  };

  // Open Edit Expense Modal
  const handleOpenEditExpense = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setEditExpFecha(exp.fecha);
    setEditExpProveedor(exp.lugarProveedor);
    setEditExpDescripcion(exp.descripcion);
    setEditExpCategoria(exp.categoria);
    setEditExpFrecuencia(exp.frecuencia || 'Sin Frecuencia');
    setEditExpEstado(exp.estado);
    setEditExpMonto(exp.monto.toString());
    setEditExpNotas(exp.notas || '');
    setEditExpErrors({});
  };

  // Close Edit Expense Modal
  const handleCloseEditExpense = () => {
    setEditingExpense(null);
    setEditExpErrors({});
  };

  // Save Edited Expense
  const handleSaveEditedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const parsedEditAmount = parseAmount(editExpMonto) || parseFloat(editExpMonto) || 0;
    const errors: Record<string, string> = {};
    if (!editExpProveedor.trim()) errors['proveedor'] = 'Ingresa el lugar o proveedor';
    if (!editExpDescripcion.trim()) errors['descripcion'] = 'Ingresa la descripción del gasto';
    if (!editExpMonto || parsedEditAmount <= 0) errors['monto'] = 'Ingresa un monto válido mayor a 0';

    if (Object.keys(errors).length > 0) {
      setEditExpErrors(errors);
      return;
    }

    const updated = expenses.map((item) =>
      item.id === editingExpense.id
        ? {
            ...item,
            fecha: editExpFecha,
            lugarProveedor: editExpProveedor.trim(),
            descripcion: editExpDescripcion.trim(),
            categoria: editExpCategoria,
            frecuencia: editExpFrecuencia,
            estado: editExpEstado,
            monto: parsedEditAmount,
            notas: editExpNotas.trim() || undefined,
          }
        : item
    );

    setExpenses(updated);
    try {
      localStorage.setItem(expensesStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('crm-data-updated'));
    } catch (err) {
      console.error('Error saving edited expense', err);
    }

    setEditingExpense(null);
    showToast('¡Gasto / Deuda actualizado exitosamente!');
  };

  // Delete Expense
  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    try {
      localStorage.setItem(expensesStorageKey, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('crm-data-updated'));
    } catch (e) {
      console.error('Error deleting expense', e);
    }
    showToast('Registro de gasto eliminado.');
  };

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (filterFecha && s.fecha !== filterFecha) return false;
      if (filterDebtorOnly && (s.montoPendiente || 0) <= 0) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const text = `${s.cliente} ${s.servicio} ${s.metodoPago} ${s.colaborador || ''}`.toLowerCase();
        if (!text.includes(term)) return false;
      }
      return true;
    });
  }, [sales, filterFecha, filterDebtorOnly, searchTerm]);

  // Outstanding Debtors List
  const activeDebtors = useMemo(() => {
    return sales.filter((s) => (s.montoPendiente || 0) > 0);
  }, [sales]);

  // ================= MATHEMATICAL KPI ENGINE (Today, Month, Year) =================
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // "YYYY-MM"
  const currentYearStr = todayStr.substring(0, 4); // "YYYY"

  // 1. Total Cobrado Hoy
  const totalCobradoHoy = useMemo(() => {
    return sales
      .filter((s) => s.fecha === todayStr)
      .reduce((sum, s) => sum + (s.montoPagado ?? (s.precioCobrado - (s.montoPendiente || 0))), 0);
  }, [sales, todayStr]);

  // 2. Total Cobrado del Mes
  const totalCobradoMes = useMemo(() => {
    return sales
      .filter((s) => s.fecha && s.fecha.startsWith(currentMonthStr))
      .reduce((sum, s) => sum + (s.montoPagado ?? (s.precioCobrado - (s.montoPendiente || 0))), 0);
  }, [sales, currentMonthStr]);

  // 3. Total Cobrado en lo que va del Año
  const totalCobradoAnio = useMemo(() => {
    return sales
      .filter((s) => s.fecha && s.fecha.startsWith(currentYearStr))
      .reduce((sum, s) => sum + (s.montoPagado ?? (s.precioCobrado - (s.montoPendiente || 0))), 0);
  }, [sales, currentYearStr]);

  // 4. Saldos Pendientes de Hoy
  const saldosPendientesHoy = useMemo(() => {
    return sales
      .filter((s) => s.fecha === todayStr)
      .reduce((sum, s) => sum + (s.montoPendiente || 0), 0);
  }, [sales, todayStr]);

  // 5. Saldos Pendientes del Mes
  const saldosPendientesMes = useMemo(() => {
    return sales
      .filter((s) => s.fecha && s.fecha.startsWith(currentMonthStr))
      .reduce((sum, s) => sum + (s.montoPendiente || 0), 0);
  }, [sales, currentMonthStr]);

  // 6. Total de Dinero que Deben los Clientes en lo que va del Año
  const totalDebenClientesAnio = useMemo(() => {
    return sales
      .filter((s) => s.fecha && s.fecha.startsWith(currentYearStr))
      .reduce((sum, s) => sum + (s.montoPendiente || 0), 0);
  }, [sales, currentYearStr]);

  // ================= EXPENSES KPI CALCULATIONS =================
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  // Gastos Semanales (últimos 7 días)
  const gastosSemanales = useMemo(() => {
    return expenses
      .filter((e) => new Date(e.fecha) >= sevenDaysAgo)
      .reduce((sum, e) => sum + (e.monto || 0), 0);
  }, [expenses]);

  // Gastos Mensuales (mes actual)
  const gastosMensuales = useMemo(() => {
    return expenses
      .filter((e) => e.fecha && e.fecha.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + (e.monto || 0), 0);
  }, [expenses, currentMonthStr]);

  // Gastos Anuales (año actual)
  const gastosAnuales = useMemo(() => {
    return expenses
      .filter((e) => e.fecha && e.fecha.startsWith(currentYearStr))
      .reduce((sum, e) => sum + (e.monto || 0), 0);
  }, [expenses, currentYearStr]);

  // Total Deudas Pendientes por Pagar del Negocio
  const totalDeudasNegocioPendientes = useMemo(() => {
    return expenses
      .filter((e) => e.estado === 'Pendiente por Pagar')
      .reduce((sum, e) => sum + (e.monto || 0), 0);
  }, [expenses]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filterExpCategory !== 'all' && e.categoria !== filterExpCategory) return false;
      if (filterExpDebtsOnly && e.estado !== 'Pendiente por Pagar') return false;
      return true;
    });
  }, [expenses, filterExpCategory, filterExpDebtsOnly]);

  // ================= CLIENTES ATENDIDOS & MOVIMIENTO DEL NEGOCIO =================
  // Clientes atendidos Hoy
  const statsClientesHoy = useMemo(() => {
    const records = sales.filter((s) => s.fecha === todayStr);
    const uniqueClients = new Set(records.map((s) => s.cliente.trim().toLowerCase())).size;
    const totalCobrado = records.reduce(
      (sum, s) => sum + (s.montoPagado ?? s.precioCobrado - (s.montoPendiente || 0)),
      0
    );
    return {
      serviciosCount: records.length,
      clientesCount: uniqueClients,
      totalCobrado,
      ticketPromedio: records.length > 0 ? totalCobrado / records.length : 0,
      records,
    };
  }, [sales, todayStr]);

  // Clientes atendidos en la Semana (últimos 7 días)
  const statsClientesSemana = useMemo(() => {
    const records = sales.filter((s) => new Date(s.fecha) >= sevenDaysAgo);
    const uniqueClients = new Set(records.map((s) => s.cliente.trim().toLowerCase())).size;
    const totalCobrado = records.reduce(
      (sum, s) => sum + (s.montoPagado ?? s.precioCobrado - (s.montoPendiente || 0)),
      0
    );
    return {
      serviciosCount: records.length,
      clientesCount: uniqueClients,
      totalCobrado,
      ticketPromedio: records.length > 0 ? totalCobrado / records.length : 0,
      records,
    };
  }, [sales, sevenDaysAgo]);

  // Clientes atendidos en el Mes (mes actual)
  const statsClientesMes = useMemo(() => {
    const records = sales.filter((s) => s.fecha && s.fecha.startsWith(currentMonthStr));
    const uniqueClients = new Set(records.map((s) => s.cliente.trim().toLowerCase())).size;
    const totalCobrado = records.reduce(
      (sum, s) => sum + (s.montoPagado ?? s.precioCobrado - (s.montoPendiente || 0)),
      0
    );
    return {
      serviciosCount: records.length,
      clientesCount: uniqueClients,
      totalCobrado,
      ticketPromedio: records.length > 0 ? totalCobrado / records.length : 0,
      records,
    };
  }, [sales, currentMonthStr]);

  // Clientes atendidos en el Año (año actual)
  const statsClientesAnio = useMemo(() => {
    const records = sales.filter((s) => s.fecha && s.fecha.startsWith(currentYearStr));
    const uniqueClients = new Set(records.map((s) => s.cliente.trim().toLowerCase())).size;
    const totalCobrado = records.reduce(
      (sum, s) => sum + (s.montoPagado ?? s.precioCobrado - (s.montoPendiente || 0)),
      0
    );
    return {
      serviciosCount: records.length,
      clientesCount: uniqueClients,
      totalCobrado,
      ticketPromedio: records.length > 0 ? totalCobrado / records.length : 0,
      records,
    };
  }, [sales, currentYearStr]);

  // Active Selected Movement Stats
  const currentMovementStats = useMemo(() => {
    switch (movementPeriod) {
      case 'hoy':
        return { label: 'Hoy', periodKey: 'hoy', ...statsClientesHoy };
      case 'semana':
        return { label: 'Últimos 7 Días (Semana)', periodKey: 'semana', ...statsClientesSemana };
      case 'mes':
        return { label: 'Este Mes', periodKey: 'mes', ...statsClientesMes };
      case 'anio':
        return { label: 'En lo que va del Año', periodKey: 'anio', ...statsClientesAnio };
      default:
        return { label: 'Hoy', periodKey: 'hoy', ...statsClientesHoy };
    }
  }, [movementPeriod, statsClientesHoy, statsClientesSemana, statsClientesMes, statsClientesAnio]);

  // Export Sales to CSV
  const handleExportSalesCSV = () => {
    const headers = [
      'Fecha',
      'Cliente',
      'Teléfono / WhatsApp',
      'Servicio Realizado',
      'Atendido Por',
      'Precio Total',
      'Monto Pagado',
      'Saldo Pendiente',
      'Método de Pago',
      'Notas',
    ];
    const rows = filteredSales.map((s) => [
      s.fecha,
      s.cliente,
      s.clientePhone || 'N/D',
      s.servicio,
      s.colaborador || 'Atención General',
      formatAmount(s.precioCobrado),
      formatAmount(s.montoPagado ?? s.precioCobrado),
      formatAmount(s.montoPendiente ?? 0),
      s.metodoPago,
      s.notas || '',
    ]);
    downloadCSV(
      `${businessName.replace(/\s+/g, '_')}_Registro_Ventas_Cobros.csv`,
      headers,
      rows
    );
    showToast('Reporte de ventas exportado a CSV.');
  };

  // Export Expenses to CSV
  const handleExportExpensesCSV = () => {
    const headers = [
      'Fecha',
      'Lugar / Proveedor',
      'Descripción',
      'Categoría',
      'Frecuencia',
      'Estado',
      'Monto',
      'Notas',
    ];
    const rows = filteredExpenses.map((e) => [
      e.fecha,
      e.lugarProveedor,
      e.descripcion,
      e.categoria,
      e.frecuencia,
      e.estado,
      formatAmount(e.monto),
      e.notas || '',
    ]);
    downloadCSV(
      `${businessName.replace(/\s+/g, '_')}_Control_Gastos_Deudas.csv`,
      headers,
      rows
    );
    showToast('Reporte de gastos exportado a CSV.');
  };

  return (
    <div className="space-y-7">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500/50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1322] text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Entradas, Cuentas por Cobrar & Gastos
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                {sales.length} servicios registrados
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Control de dinero ingresado, saldos pendientes de clientes y gastos/deudas para{' '}
              <strong className="text-slate-200">{businessName}</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportSalesCSV}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Ventas (.CSV)</span>
          </button>
        </div>
      </div>

      {/* ================= SECCIÓN 1: LOS 6 INDICADORES CLAVE DE VENTAS Y COBROS ================= */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Resumen Financiero de Cobros & Cuentas por Cobrar
          </h4>
          <span className="text-[11px] text-slate-400">Cálculo en tiempo real</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Total Cobrado Hoy */}
          <div className="p-4 bg-gradient-to-br from-emerald-950/90 to-slate-900 text-white rounded-2xl border border-emerald-600/40 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Total Cobrado Hoy
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {formatAmount(totalCobradoHoy)}
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Dinero recibido efectivamente hoy
              </p>
            </div>
          </div>

          {/* 2. Total Cobrado del Mes */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-2xl border border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Cobrado del Mes
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatAmount(totalCobradoMes)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ingresos acumulados de este mes
              </p>
            </div>
          </div>

          {/* 3. Total Cobrado en lo que va del Año */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-2xl border border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Cobrado en el Año
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatAmount(totalCobradoAnio)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ingresos totales en lo que va del año
              </p>
            </div>
          </div>

          {/* 4. Saldos Pendientes por Cobrar de Hoy */}
          <div
            className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
              saldosPendientesHoy > 0
                ? 'bg-gradient-to-br from-amber-950/90 to-slate-900 border-amber-600/50 text-white'
                : 'bg-slate-900/90 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  saldosPendientesHoy > 0 ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                Saldos Pendientes de Hoy
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  saldosPendientesHoy > 0
                    ? 'bg-amber-500/30 text-amber-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                  saldosPendientesHoy > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {formatAmount(saldosPendientesHoy)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monto pendiente de servicios de hoy
              </p>
            </div>
          </div>

          {/* 5. Saldos Pendientes por Cobrar del Mes */}
          <div
            className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
              saldosPendientesMes > 0
                ? 'bg-gradient-to-br from-amber-950/90 to-slate-900 border-amber-600/50 text-white'
                : 'bg-slate-900/90 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  saldosPendientesMes > 0 ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                Saldos Pendientes del Mes
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  saldosPendientesMes > 0
                    ? 'bg-amber-500/30 text-amber-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                  saldosPendientesMes > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {formatAmount(saldosPendientesMes)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cuentas por cobrar en el mes en curso
              </p>
            </div>
          </div>

          {/* 6. Total de Dinero que Deben los Clientes en el Año */}
          <div
            className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
              totalDebenClientesAnio > 0
                ? 'bg-gradient-to-br from-rose-950/90 to-slate-900 border-rose-600/50 text-white'
                : 'bg-slate-900/90 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  totalDebenClientesAnio > 0 ? 'text-rose-300' : 'text-slate-400'
                }`}
              >
                Total Deben Clientes (Año)
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  totalDebenClientesAnio > 0
                    ? 'bg-rose-500/30 text-rose-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div
                className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                  totalDebenClientesAnio > 0 ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {formatAmount(totalDebenClientesAnio)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Deuda acumulada de clientes en el año
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN 2: FORMULARIO DE REGISTRO / CALCULADORA LIMPIA ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Registro Diario de Servicios & Cobros
              </h3>
              <p className="text-xs text-slate-500">
                Calcula automáticamente el monto cobrado hoy y el saldo pendiente sin enredos.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Moneda: {currencySymbol} ({currency})
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

            {/* 2. Cliente (Auto-complete desde Base de Clientes) */}
            <div className="relative" ref={clientDropdownRef}>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>Nombre del Cliente *</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Autocompleta clientes</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sale-input-cliente"
                  placeholder="Escribe el nombre del cliente..."
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

              {/* Predictive Dropdown */}
              {isClientDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                  <div className="p-1.5 bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 flex justify-between items-center">
                    <span>Clientes Registrados ({registeredClients.length})</span>
                    <span className="text-[10px] text-slate-400 font-normal">Clic para seleccionar</span>
                  </div>
                  {filteredClientSuggestions.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      {formCliente.trim()
                        ? 'No se encontraron coincidencias. Se guardará como nuevo.'
                        : 'Escribe para buscar.'}
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
                            <span className="text-[10px] text-slate-500 font-mono">{phone}</span>
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

            {/* 3. Teléfono / WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>Teléfono / WhatsApp (Opcional)</span>
              </label>
              <input
                type="text"
                id="sale-input-phone"
                placeholder="Ej. +504 9988-7766"
                value={formClientePhone}
                onChange={(e) => setFormClientePhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
              />
            </div>

            {/* 4. Servicio Realizado */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Receipt className="w-3 h-3 text-slate-400" />
                <span>Servicio Realizado *</span>
              </label>
              <input
                type="text"
                id="sale-input-servicio"
                placeholder="Ej. Corte y Peinado VIP"
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
              {formErrors['servicio'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {formErrors['servicio']}
                </span>
              )}
            </div>

            {/* 5. Atendido por / Especialista (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Atendido por / Profesional (Opcional)</span>
              </label>
              <input
                type="text"
                id="sale-input-colaborador"
                placeholder="Ej. Carlos M. / Dra. Laura"
                value={formColaborador}
                onChange={(e) => setFormColaborador(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
              />
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
                <option value="Transferencia">Transferencia / Depósito</option>
                <option value="Tarjeta de Crédito / Débito">Tarjeta de Crédito / Débito</option>
                <option value="Billetera Digital / QR">Billetera Digital / QR</option>
              </select>
            </div>

            {/* 7. Precio Total del Servicio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                <span>1. Precio del Servicio *</span>
              </label>
              <input
                type="number"
                id="sale-input-precio"
                placeholder="Ej. 2000.00"
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

            {/* 8. Monto Pendiente de Pago (Saldo Pendiente) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 text-rose-700">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>3. Monto Pendiente de Pago</span>
                </span>
                <span className="text-[10px] text-slate-400">0 si pagó todo</span>
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
            </div>

            {/* Dynamic Calculation Output Preview Card */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex flex-col justify-center space-y-1.5 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-0.5">
                Cálculo de Cobro en Vivo:
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Precio del Servicio:</span>
                <span className="font-bold text-white font-mono">{formatAmount(parsedPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-emerald-400">2. Pagado Hoy:</span>
                <span className="text-emerald-400 font-mono text-sm">{formatAmount(parsedPaid)}</span>
              </div>
              <div className="border-t border-slate-800 pt-1 flex justify-between items-center text-xs">
                <span className="text-slate-400">Saldo Pendiente:</span>
                <span
                  className={`font-mono font-extrabold ${
                    parsedPending > 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}
                >
                  {formatAmount(parsedPending)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              id="btn-submit-daily-sale"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Guardar Cobro del Servicio</span>
            </button>
          </div>
        </form>
      </div>

      {/* ================= SECCIÓN 3: CLIENTES DEUDORES (CUENTAS POR COBRAR) ================= */}
      {activeDebtors.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white rounded-2xl border border-rose-700/60 shadow-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Clientes con Saldo Pendiente por Cobrar
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                    Total Adeudado: {formatAmount(saldosPendientesMes)}
                  </span>
                </h4>
                <p className="text-[11px] text-rose-300/80">
                  {activeDebtors.length} cliente{activeDebtors.length === 1 ? '' : 's'} con saldo pendiente
                  en {businessName}.
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
              {filterDebtorOnly ? 'Mostrar Todos los Servicios' : 'Filtrar Solo Deudores'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {activeDebtors.map((debtor) => {
              const cleanPhone = debtor.clientePhone
                ? debtor.clientePhone.replace(/[^0-9]/g, '')
                : '';
              const waMsg = encodeURIComponent(
                `Hola ${debtor.cliente}, te saludamos cordialmente de ${businessName}. Te recordamos amablemente tu saldo pendiente de ${formatAmount(
                  debtor.montoPendiente
                )} por tu servicio de "${debtor.servicio}" del día ${
                  debtor.fecha
                }. ¡Muchas gracias por tu preferencia!`
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
                      Precio Total: {formatAmount(debtor.precioCobrado)} | Pagó Hoy:{' '}
                      {formatAmount(debtor.montoPagado ?? debtor.precioCobrado - debtor.montoPendiente)}
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

      {/* ================= SECCIÓN 4: TABLA DE SERVICIOS Y COBROS ================= */}
      <div className="space-y-3">
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

            {/* Filter Fecha */}
            <input
              type="date"
              id="filter-input-fecha"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="text-xs py-1 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
              title="Filtrar por fecha específica"
            />

            {(filterFecha || searchTerm || filterDebtorOnly) && (
              <button
                onClick={() => {
                  setFilterFecha('');
                  setSearchTerm('');
                  setFilterDebtorOnly(false);
                }}
                className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {filteredSales.length === 0 ? (
            <div className="p-10 text-center">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No hay registros de servicios</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchTerm || filterFecha || filterDebtorOnly
                  ? 'No se encontraron registros con los filtros seleccionados.'
                  : 'Ingresa los servicios del día utilizando el formulario de arriba.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Servicio Realizado</th>
                    <th className="py-3 px-4">Atendido Por</th>
                    <th className="py-3 px-4 text-right">Precio Total</th>
                    <th className="py-3 px-4 text-right">Pagado Hoy</th>
                    <th className="py-3 px-4 text-right">Saldo Pendiente</th>
                    <th className="py-3 px-4">Método de Pago</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
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
                          {sale.cliente}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{sale.servicio}</td>
                        <td className="py-3 px-4 text-slate-600">{sale.colaborador || 'General'}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatAmount(sale.precioCobrado)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatAmount(
                            sale.montoPagado ?? sale.precioCobrado - (sale.montoPendiente || 0)
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {isDebtor ? (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                              {formatAmount(sale.montoPendiente)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-normal">0.00</span>
                          )}
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
                                className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded transition-colors cursor-pointer"
                                title="Marcar saldo como pagado"
                              >
                                Saldar
                              </button>
                            )}

                            {deleteConfirmId === sale.id ? (
                              <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                                <span className="text-[10px] text-rose-700 font-bold px-1">
                                  ¿Borrar?
                                </span>
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
                                title="Eliminar registro"
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

      {/* ================= SECCIÓN 5: CONTROL DE GASTOS Y DEUDAS DEL NEGOCIO (CUENTAS POR PAGAR) ================= */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Control de Gastos & Deudas del Negocio (Cuentas por Pagar)
              </h3>
              <p className="text-xs text-slate-500">
                Registra compras a proveedores, pago de alquiler, servicios públicos, préstamos y deudas pendientes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportExpensesCSV}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Exportar Gastos (.CSV)</span>
          </button>
        </div>

        {/* Gastos & Deudas KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Gastos Semanales */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Gastos Últimos 7 Días
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
              {formatAmount(gastosSemanales)}
            </div>
            <span className="text-[11px] text-slate-500">Compras & egresos semanales</span>
          </div>

          {/* Gastos Mensuales */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Gastos del Mes en Curso
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
              {formatAmount(gastosMensuales)}
            </div>
            <span className="text-[11px] text-slate-500">Egresos operativos del mes</span>
          </div>

          {/* Gastos Anuales */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Gastos en el Año
            </span>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
              {formatAmount(gastosAnuales)}
            </div>
            <span className="text-[11px] text-slate-500">Acumulado anual del negocio</span>
          </div>

          {/* Total Deudas Pendientes por Pagar del Negocio */}
          <div
            className={`p-4 rounded-xl border shadow-2xs ${
              totalDeudasNegocioPendientes > 0
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <span className="text-[10px] font-bold uppercase text-rose-700 block">
              Deudas Pendientes por Pagar
            </span>
            <div className="text-xl font-extrabold text-rose-700 font-mono mt-1">
              {formatAmount(totalDeudasNegocioPendientes)}
            </div>
            <span className="text-[11px] text-rose-600">Por pagar a proveedores / servicios</span>
          </div>
        </div>

        {/* Expense Registration Form */}
        <form onSubmit={handleAddExpense} className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            + Anotar Nuevo Gasto / Deuda del Negocio
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Fecha */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={expFecha}
                onChange={(e) => setExpFecha(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-medium"
                required
              />
            </div>

            {/* Lugar / Proveedor */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Lugar / Proveedor / Entidad *
              </label>
              <input
                type="text"
                placeholder="Ej. Distribuidora Central / Dueño del Local"
                value={expProveedor}
                onChange={(e) => setExpProveedor(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-medium"
                required
              />
              {expErrors['proveedor'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {expErrors['proveedor']}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Descripción del Gasto o Deuda *
              </label>
              <input
                type="text"
                placeholder="Ej. Compra de champús, Alquiler, Recibo de luz"
                value={expDescripcion}
                onChange={(e) => setExpDescripcion(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-medium"
                required
              />
              {expErrors['descripcion'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {expErrors['descripcion']}
                </span>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Categoría</label>
              <select
                value={expCategoria}
                onChange={(e) => setExpCategoria(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-medium cursor-pointer"
              >
                <option value="Insumos & Productos">Insumos & Productos</option>
                <option value="Alquiler / Renta">Alquiler / Renta</option>
                <option value="Servicios Básicos (Luz/Agua/Net)">Servicios Básicos (Luz/Agua/Net)</option>
                <option value="Cuota Préstamo / Crédito">Cuota Préstamo / Crédito</option>
                <option value="Mantenimiento & Equipos">Mantenimiento & Equipos</option>
                <option value="Sueldos / Pagos">Sueldos / Pagos</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Frecuencia */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Frecuencia</label>
              <select
                value={expFrecuencia}
                onChange={(e) => setExpFrecuencia(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-medium cursor-pointer"
              >
                <option value="Puntual / Diario">Puntual / Diario</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensual">Mensual</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Estado del Pago</label>
              <select
                value={expEstado}
                onChange={(e) => setExpEstado(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-bold cursor-pointer"
              >
                <option value="Pagado">✅ Pagado</option>
                <option value="Pendiente por Pagar">⏳ Pendiente por Pagar (Deuda)</option>
              </select>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Monto ({currencySymbol}) *</label>
              <input
                type="number"
                placeholder="Ej. 1500.00"
                min="0"
                step="any"
                value={expMonto}
                onChange={(e) => setExpMonto(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-bold"
                required
              />
              {expErrors['monto'] && (
                <span className="text-[10px] text-rose-500 font-medium mt-0.5 block">
                  {expErrors['monto']}
                </span>
              )}
            </div>

            {/* Notas opcionales */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Notas Adicionales (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Factura #4588 / Vence a fin de mes"
                value={expNotas}
                onChange={(e) => setExpNotas(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 px-5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Guardar Gasto / Deuda</span>
            </button>
          </div>
        </form>

        {/* Expenses List & Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              Historial de Gastos & Cuentas por Pagar ({filteredExpenses.length})
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterExpCategory}
                onChange={(e) => setFilterExpCategory(e.target.value)}
                className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
              >
                <option value="all">Todas las Categorías</option>
                <option value="Insumos & Productos">Insumos & Productos</option>
                <option value="Alquiler / Renta">Alquiler / Renta</option>
                <option value="Servicios Básicos (Luz/Agua/Net)">Servicios Básicos</option>
                <option value="Cuota Préstamo / Crédito">Préstamos / Créditos</option>
                <option value="Mantenimiento & Equipos">Mantenimiento</option>
                <option value="Sueldos / Pagos">Sueldos</option>
                <option value="Otro">Otro</option>
              </select>

              <button
                type="button"
                onClick={() => setFilterExpDebtsOnly(!filterExpDebtsOnly)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  filterExpDebtsOnly
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filterExpDebtsOnly ? 'Mostrar Todo' : 'Solo Deudas Pendientes'}
              </button>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay gastos registrados en esta categoría.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Lugar / Proveedor</th>
                    <th className="py-2.5 px-3">Descripción</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Frecuencia</th>
                    <th className="py-2.5 px-3 text-right">Monto</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredExpenses.map((exp) => {
                    const isPending = exp.estado === 'Pendiente por Pagar';
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {exp.fecha}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{exp.lugarProveedor}</td>
                        <td className="py-2.5 px-3 text-slate-700">{exp.descripcion}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {exp.categoria}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500">{exp.frecuencia}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {formatAmount(exp.monto)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            }`}
                          >
                            {exp.estado}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => handleSettleExpense(exp.id)}
                                className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded cursor-pointer"
                                title="Marcar como pagado"
                              >
                                Marcar Pagado
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Eliminar gasto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
    </div>
  );
};
