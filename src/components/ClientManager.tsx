import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  Phone,
  Calendar,
  Sparkles,
  Download,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { CRMField, ClientRecord } from '../types';
import { downloadCSV } from '../utils/exportUtils';
import confetti from 'canvas-confetti';

interface ClientManagerProps {
  fields: CRMField[];
  businessName: string;
  currencySymbol?: string;
  sampleData?: Record<string, string>;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  fields,
  businessName,
  currencySymbol = '$',
  sampleData,
  onOpenChatWithPrompt,
}) => {
  const storageKey = useMemo(
    () => `crm_client_db_${businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    [businessName]
  );

  // Load clients from localStorage or seed initial data
  const [clients, setClients] = useState<ClientRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading clients from localStorage', e);
    }

    // Seed with 3 realistic initial clients if empty
    const initialRecords: ClientRecord[] = [];
    const now = new Date();

    const sample1Data: Record<string, any> = {};
    const sample2Data: Record<string, any> = {};
    const sample3Data: Record<string, any> = {};

    fields.forEach((f) => {
      const name = f.name;
      const lower = name.toLowerCase();

      if (lower.includes('nombre') || lower.includes('cliente')) {
        sample1Data[name] = 'Mariana Soto Alvarado';
        sample2Data[name] = 'Carlos Eduardo Mendoza';
        sample3Data[name] = 'Dra. Sofía Valladares';
      } else if (lower.includes('whatsapp') || lower.includes('teléfono') || lower.includes('telefono') || lower.includes('celular')) {
        sample1Data[name] = '+504 9876-5432';
        sample2Data[name] = '+504 9555-1234';
        sample3Data[name] = '+504 9988-7711';
      } else if (lower.includes('email') || lower.includes('correo')) {
        sample1Data[name] = 'mariana.soto@gmail.com';
        sample2Data[name] = 'carlos.mendoza90@yahoo.com';
        sample3Data[name] = 'sofia.valladares@outlook.com';
      } else if (lower.includes('rtn') || lower.includes('identidad') || lower.includes('dni')) {
        sample1Data[name] = '0801-1994-12345';
        sample2Data[name] = '0501-1988-54321';
        sample3Data[name] = '0801-1990-98765';
      } else if (lower.includes('alergia') || lower.includes('sensibilidad')) {
        sample1Data[name] = 'Piel sensible a fragancias fuertes';
        sample2Data[name] = 'Sin alergias conocidas';
        sample3Data[name] = 'Alergia al látex / Usar guantes nitrilo';
      } else if (lower.includes('piel') || lower.includes('cutis')) {
        sample1Data[name] = 'Mixta a grasa';
        sample2Data[name] = 'Normal';
        sample3Data[name] = 'Seca con tendencia a rosácea';
      } else if (lower.includes('servicio') || lower.includes('historial') || lower.includes('tratamiento') || lower.includes('corte') || lower.includes('fórmula') || lower.includes('formula')) {
        sample1Data[name] = sampleData?.[name] || 'Tratamiento completo VIP + Matiz de color';
        sample2Data[name] = 'Corte Fade Navaja + Perfilado de Barba';
        sample3Data[name] = 'Limpieza con Ultrasonido + Evaluación Periódica';
      } else if (lower.includes('preferencia') || lower.includes('bebida') || lower.includes('música') || lower.includes('musica')) {
        sample1Data[name] = 'Café negro con stevia / Música suave';
        sample2Data[name] = 'Agua con gas bien fría';
        sample3Data[name] = 'Té verde / Silencio durante sesión';
      } else if (lower.includes('fecha') || lower.includes('nacimiento') || lower.includes('visita') || lower.includes('cita')) {
        sample1Data[name] = '2026-08-15';
        sample2Data[name] = '2026-08-18';
        sample3Data[name] = '2026-08-19';
      } else if (lower.includes('gasto') || lower.includes('total') || lower.includes('monto') || lower.includes('precio') || lower.includes('ticket')) {
        sample1Data[name] = `${currencySymbol} 850`;
        sample2Data[name] = `${currencySymbol} 450`;
        sample3Data[name] = `${currencySymbol} 1,200`;
      } else {
        sample1Data[name] = sampleData?.[name] || f.example;
        sample2Data[name] = f.example;
        sample3Data[name] = f.example;
      }
    });

    initialRecords.push({
      id: 'cli-001',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data: sample1Data,
    });
    initialRecords.push({
      id: 'cli-002',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      data: sample2Data,
    });
    initialRecords.push({
      id: 'cli-003',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      data: sample3Data,
    });

    return initialRecords;
  });

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // State for Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [viewingClient, setViewingClient] = useState<ClientRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving clients to localStorage', e);
    }
  }, [clients, storageKey]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Open modal to create new client
  const handleOpenCreate = () => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.name] = '';
    });
    setFormData(initial);
    setFormErrors({});
    setEditingClient(null);
    setIsFormOpen(true);
  };

  // Open modal to edit existing client
  const handleOpenEdit = (client: ClientRecord) => {
    const populated: Record<string, any> = {};
    fields.forEach((f) => {
      populated[f.name] = client.data[f.name] ?? '';
    });
    setFormData(populated);
    setFormErrors({});
    setEditingClient(client);
    setIsFormOpen(true);
  };

  // Handle saving form data
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.isRequired && (!formData[f.name] || String(formData[f.name]).trim() === '')) {
        errors[f.name] = `El campo "${f.name}" es obligatorio`;
      }
    });

    // Check if at least a name or phone exists
    const hasAnyIdentifier = Object.values(formData).some((v) => v && String(v).trim().length > 0);
    if (!hasAnyIdentifier) {
      errors['general'] = 'Por favor completa al menos los datos principales del cliente.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingClient) {
      // Update
      const updatedList = clients.map((c) =>
        c.id === editingClient.id
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              data: { ...formData },
            }
          : c
      );
      setClients(updatedList);
      showToast(`¡Cliente "${getClientDisplayName(formData)}" actualizado con éxito!`);
    } else {
      // Create
      const newClient: ClientRecord = {
        id: `cli-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
        data: { ...formData },
      };
      setClients([newClient, ...clients]);
      showToast(`¡Cliente "${getClientDisplayName(formData)}" registrado con éxito!`);
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.6 },
      });
    }

    setIsFormOpen(false);
    setEditingClient(null);
    setFormData({});
  };

  // Delete client
  const handleDeleteClient = (id: string) => {
    const toDelete = clients.find((c) => c.id === id);
    const clientName = toDelete ? getClientDisplayName(toDelete.data) : 'Cliente';
    setClients(clients.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
    if (viewingClient?.id === id) {
      setViewingClient(null);
    }
    showToast(`Cliente "${clientName}" eliminado.`);
  };

  // Helper to extract primary display name
  const getClientDisplayName = (data: Record<string, any>): string => {
    for (const key of Object.keys(data)) {
      if (key.toLowerCase().includes('nombre') && data[key]) {
        return String(data[key]);
      }
    }
    const firstVal = Object.values(data).find((v) => v && String(v).trim().length > 0);
    return firstVal ? String(firstVal) : 'Cliente sin nombre';
  };

  // Helper to extract phone/whatsapp
  const getClientPhone = (data: Record<string, any>): string | null => {
    for (const key of Object.keys(data)) {
      const lower = key.toLowerCase();
      if ((lower.includes('whatsapp') || lower.includes('teléfono') || lower.includes('telefono') || lower.includes('celular')) && data[key]) {
        return String(data[key]);
      }
    }
    return null;
  };

  // Helper to extract email
  const getClientEmail = (data: Record<string, any>): string | null => {
    for (const key of Object.keys(data)) {
      if (key.toLowerCase().includes('email') || key.toLowerCase().includes('correo')) {
        return String(data[key]);
      }
    }
    return null;
  };

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const allText = Object.values(client.data).join(' ').toLowerCase();
      return allText.includes(term);
    });
  }, [clients, searchTerm]);

  // Group fields by category for the dynamic form and dossier view
  const categorizedFields = useMemo(() => {
    const map: Record<string, CRMField[]> = {
      'Datos Generales': [],
      'Especialidad / Historial Técnico': [],
      'Preferencias & Hábitos': [],
      'Financiero & Fidelización': [],
    };

    fields.forEach((f) => {
      if (map[f.category]) {
        map[f.category].push(f);
      } else {
        if (!map['Otros']) map['Otros'] = [];
        map['Otros'].push(f);
      }
    });

    return map;
  }, [fields]);

  // Export current clients to CSV
  const handleExportClientsCSV = () => {
    const headers = ['ID', 'Fecha Registro', ...fields.map((f) => f.name)];
    const rows = filteredClients.map((c) => [
      c.id,
      new Date(c.createdAt).toLocaleDateString(),
      ...fields.map((f) => c.data[f.name] || ''),
    ]);
    downloadCSV(`${businessName.replace(/\s+/g, '_')}_Base_Datos_Clientes.csv`, headers, rows);
    showToast('Base de datos descargada en formato CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-500/50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header bar with counter, search and Register button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gestor y Base de Datos de Clientes Reales
              </h3>
              <p className="text-xs text-slate-500">
                Almacenamiento persistente en navegador (localStorage). Total:{' '}
                <span className="font-bold text-emerald-700">{clients.length} clientes</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            id="btn-export-clients-csv"
            onClick={handleExportClientsCSV}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Exportar clientes actuales a Excel/Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            id="btn-register-new-client"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Registrar Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-search-clients"
            placeholder="Buscar por nombre, teléfono, notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {searchTerm && (
          <span className="text-xs text-slate-500">
            Mostrando <span className="font-semibold text-slate-800">{filteredClients.length}</span> de {clients.length} clientes
          </span>
        )}
      </div>

      {/* Interactive Clients Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No se encontraron clientes</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No hay registros que coincidan con "${searchTerm}". Intenta con otro término o limpia el buscador.`
                : 'Aún no has registrado clientes. Haz clic en "+ Registrar Nuevo Cliente" para empezar.'}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
              >
                Limpiar búsqueda
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Registrar Primer Cliente</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Cliente / Contacto</th>
                  <th className="py-3.5 px-4">Historial / Ficha Técnica</th>
                  <th className="py-3.5 px-4">Preferencias / Salud</th>
                  <th className="py-3.5 px-4">Registro</th>
                  <th className="py-3.5 px-4 text-right">Acciones Directas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredClients.map((client) => {
                  const name = getClientDisplayName(client.data);
                  const phone = getClientPhone(client.data);
                  const email = getClientEmail(client.data);

                  // Extract technical fields
                  const technicalField = fields.find((f) => f.category === 'Especialidad / Historial Técnico');
                  const technicalVal = technicalField ? client.data[technicalField.name] : null;

                  // Extract preferences or allergy
                  const allergyField = fields.find((f) => f.name.toLowerCase().includes('alergia') || f.name.toLowerCase().includes('piel'));
                  const allergyVal = allergyField ? client.data[allergyField.name] : null;

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/90 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">
                              {name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {phone && (
                                <a
                                  href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                                  title="Enviar WhatsApp directo"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{phone}</span>
                                </a>
                              )}
                              {email && (
                                <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                                  {email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Technical Notes / Specialty */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {technicalVal ? (
                          <div className="line-clamp-2 text-xs text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-100">
                            <span className="font-bold text-[10px] uppercase text-slate-400 block">
                              {technicalField?.name || 'Técnico'}:
                            </span>
                            <span>{technicalVal}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Sin historial registrado</span>
                        )}
                      </td>

                      {/* Health / Allergies / Preferences */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {allergyVal ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate max-w-[160px]">{allergyVal}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(client.createdAt).toLocaleDateString('es-HN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            id={`btn-view-client-${client.id}`}
                            onClick={() => setViewingClient(client)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            title="Ver ficha técnica completa"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Ver Ficha</span>
                          </button>

                          <button
                            type="button"
                            id={`btn-edit-client-${client.id}`}
                            onClick={() => handleOpenEdit(client)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-blue-200"
                            title="Editar datos de este cliente"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          {deleteConfirmId === client.id ? (
                            <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                              <span className="text-[10px] text-rose-700 font-bold px-1">¿Borrar?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteClient(client.id)}
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
                              id={`btn-delete-client-${client.id}`}
                              onClick={() => setDeleteConfirmId(client.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar cliente"
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

      {/* ================= MODAL: REGISTRAR / EDITAR CLIENTE ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingClient ? 'Editar Ficha de Cliente' : 'Registrar Nuevo Cliente'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Formulario dinámico sincronizado con las columnas de tu CRM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Dynamic inputs */}
            <form onSubmit={handleSaveClient} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {formErrors['general'] && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors['general']}</span>
                </div>
              )}

              {Object.entries(categorizedFields).map(([category, catFields]) => {
                if (catFields.length === 0) return null;
                return (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                      <span>{category}</span>
                      <span className="text-[10px] font-normal text-slate-400 lowercase">
                        ({catFields.length} campos)
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {catFields.map((field) => {
                        const val = formData[field.name] ?? '';
                        const hasError = formErrors[field.name];
                        const isLongText =
                          field.name.toLowerCase().includes('historial') ||
                          field.name.toLowerCase().includes('fórmula') ||
                          field.name.toLowerCase().includes('formula') ||
                          field.name.toLowerCase().includes('notas') ||
                          field.name.toLowerCase().includes('antecedentes');

                        return (
                          <div
                            key={field.name}
                            className={isLongText ? 'sm:col-span-2' : ''}
                          >
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <span>{field.name}</span>
                                {field.isRequired && (
                                  <span className="text-rose-500 font-bold" title="Campo obligatorio">
                                    *
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {field.type}
                              </span>
                            </label>

                            {isLongText ? (
                              <textarea
                                rows={2}
                                value={val}
                                onChange={(e) =>
                                  setFormData({ ...formData, [field.name]: e.target.value })
                                }
                                placeholder={field.example ? `Ej. ${field.example}` : `Ingresa ${field.name}`}
                                className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white transition-all text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                  hasError
                                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                                    : 'border-slate-200 focus:border-emerald-500'
                                }`}
                              />
                            ) : field.type === 'Fecha' ? (
                              <input
                                type="date"
                                value={val}
                                onChange={(e) =>
                                  setFormData({ ...formData, [field.name]: e.target.value })
                                }
                                className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white transition-all text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                  hasError
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-slate-200 focus:border-emerald-500'
                                }`}
                              />
                            ) : (
                              <input
                                type={
                                  field.type === 'Número'
                                    ? 'number'
                                    : field.name.toLowerCase().includes('email') || field.name.toLowerCase().includes('correo')
                                    ? 'email'
                                    : 'text'
                                }
                                value={val}
                                onChange={(e) =>
                                  setFormData({ ...formData, [field.name]: e.target.value })
                                }
                                placeholder={field.example ? `Ej. ${field.example}` : `Ingresa ${field.name}`}
                                className={`w-full text-xs p-2.5 rounded-xl border bg-slate-50 focus:bg-white transition-all text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                                  hasError
                                    ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20'
                                    : 'border-slate-200 focus:border-emerald-500'
                                }`}
                              />
                            )}

                            {hasError ? (
                              <span className="text-[10px] text-rose-500 mt-1 block font-medium">
                                {hasError}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                                {field.purpose}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Action Buttons inside Form */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-client-form"
                  className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VER FICHA COMPLETA ================= */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-850 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  {getClientDisplayName(viewingClient.data).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {getClientDisplayName(viewingClient.data)}
                  </h3>
                  <p className="text-xs text-emerald-400">
                    Ficha Técnica Individual • ID: {viewingClient.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingClient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Quick WhatsApp Bar if phone exists */}
              {getClientPhone(viewingClient.data) && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        WhatsApp: {getClientPhone(viewingClient.data)}
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Inicia una conversación directa desde tu WhatsApp Web o móvil
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${getClientPhone(viewingClient.data)?.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-all shrink-0"
                  >
                    <span>Abrir Chat</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Categorized Fields Display */}
              {Object.entries(categorizedFields).map(([category, catFields]) => {
                if (catFields.length === 0) return null;
                return (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                      {category}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {catFields.map((field) => {
                        const val = viewingClient.data[field.name];
                        return (
                          <div
                            key={field.name}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                          >
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              {field.name}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 break-words block">
                              {val !== undefined && val !== '' ? String(val) : (
                                <span className="text-slate-400 font-normal italic">No registrado</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Registrado el {new Date(viewingClient.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const client = viewingClient;
                    setViewingClient(null);
                    handleOpenEdit(client);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Editar Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingClient(null)}
                  className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
