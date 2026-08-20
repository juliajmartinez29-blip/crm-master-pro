import React, { useState } from 'react';
import {
  X,
  History,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageCircle,
  CreditCard,
  User,
  Sparkles,
  UserCheck,
  Check,
} from 'lucide-react';
import { ClientRecord, SaleRecord } from '../types';
import { formatAmount } from '../utils/formatUtils';

interface ClientVisitsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientRecord | null;
  clientName: string;
  clientPhone?: string;
  businessName: string;
  sales: SaleRecord[];
  onUpdateSaleRecord?: (updatedSale: SaleRecord) => void;
}

export const ClientVisitsHistoryModal: React.FC<ClientVisitsHistoryModalProps> = ({
  isOpen,
  onClose,
  client,
  clientName,
  clientPhone,
  businessName,
  sales,
  onUpdateSaleRecord,
}) => {
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen || !client) return null;

  // Filter sales matching this client by name (case-insensitive) or phone
  const clientSales = sales.filter((s) => {
    const sClient = s.cliente.trim().toLowerCase();
    const targetName = clientName.trim().toLowerCase();
    return sClient === targetName || (s.clientePhone && clientPhone && s.clientePhone.replace(/[^0-9]/g, '') === clientPhone.replace(/[^0-9]/g, ''));
  });

  // Calculate totals
  let totalBilled = 0;
  let totalPending = 0;

  clientSales.forEach((s) => {
    totalBilled += s.precioCobrado || 0;
    totalPending += s.montoPendiente || 0;
  });

  const totalPaid = Math.max(0, totalBilled - totalPending);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSettleDebt = (sale: SaleRecord) => {
    if (!onUpdateSaleRecord) return;
    const updated: SaleRecord = {
      ...sale,
      montoPendiente: 0,
      montoPagado: sale.precioCobrado,
      notas: (sale.notas ? sale.notas + ' | ' : '') + `Deuda saldada el ${new Date().toLocaleDateString()}`,
    };
    onUpdateSaleRecord(updated);
    showToast('¡Saldo pendiente saldado con éxito!');
  };

  // WhatsApp link for reminder if pending debt
  const cleanPhone = clientPhone ? clientPhone.replace(/[^0-9]/g, '') : '';
  const waDebtMessage = encodeURIComponent(
    `Hola ${clientName}, te saludamos de ${businessName}. Te escribimos cordialmente para dar seguimiento a tu servicio y recordarte que tienes un saldo pendiente de ${formatAmount(totalPending)}. ¿Te gustaría realizar una transferencia o pasar por el local? ¡Muchas gracias!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Toast */}
        {successToast && (
          <div className="absolute top-4 right-4 z-60 bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Historial de Visitas y Saldos
                </h3>
                {totalPending > 0 ? (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Saldo Pendiente: {formatAmount(totalPending)}
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Al Día
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-emerald-400">{clientName}</span>
                {clientPhone && <span>• {clientPhone}</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Metrics Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Visitas
              </span>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {clientSales.length}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Facturado
              </span>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                {formatAmount(totalBilled)}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                Total Pagado
              </span>
              <div className="text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
                {formatAmount(totalPaid)}
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border shadow-2xs ${
                totalPending > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <span
                className={`text-[10px] uppercase font-bold block ${
                  totalPending > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                Saldo Adeudado
              </span>
              <div className="text-lg font-extrabold font-mono mt-0.5">
                {formatAmount(totalPending)}
              </div>
            </div>
          </div>

          {/* Action banner if client owes debt */}
          {totalPending > 0 && cleanPhone && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Este cliente tiene un saldo pendiente de <strong>{formatAmount(totalPending)}</strong>.
                </span>
              </div>
              <a
                href={`https://wa.me/${cleanPhone}?text=${waDebtMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Cobrar por WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        {/* Visits & Debt Table */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
            <span>Registro Detallado de Visitas y Consumos</span>
            <span className="text-[11px] font-normal text-slate-500">
              Orden cronológico
            </span>
          </h4>

          {clientSales.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h5 className="text-xs font-bold text-slate-700">Sin visitas registradas todavía</h5>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                Cuando registres servicios para {clientName} en la pestaña "Control de Colaboradores y Finanzas", aparecerán aquí con su detalle de pagos y saldos.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Servicio</th>
                      <th className="py-2.5 px-3">Atendido por</th>
                      <th className="py-2.5 px-3 text-right">Precio Total</th>
                      <th className="py-2.5 px-3 text-right">Saldo Pendiente</th>
                      <th className="py-2.5 px-3">Estado / Pago</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {clientSales.map((sale) => {
                      const isPending = (sale.montoPendiente || 0) > 0;
                      return (
                        <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                            {sale.fecha}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {sale.servicio}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {sale.colaborador}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatAmount(sale.precioCobrado)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold">
                            {isPending ? (
                              <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                {formatAmount(sale.montoPendiente)}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-normal">
                                0.00
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <AlertCircle className="w-3 h-3 text-rose-600" />
                                Debe saldo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Pagado ({sale.metodoPago || 'Efectivo'})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            {isPending && onUpdateSaleRecord ? (
                              <button
                                type="button"
                                onClick={() => handleSettleDebt(sale)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded-md transition-colors shadow-2xs cursor-pointer"
                                title="Marcar este saldo pendiente como pagado"
                              >
                                <Check className="w-3 h-3" />
                                <span>Saldar Pago</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {clientSales.length} registro{clientSales.length === 1 ? '' : 's'} en total
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
