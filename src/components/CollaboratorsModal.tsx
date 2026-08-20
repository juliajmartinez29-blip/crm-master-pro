import React, { useState } from 'react';
import {
  X,
  Users,
  Plus,
  Trash2,
  Check,
  UserCheck,
  Percent,
  Phone,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { CollaboratorItem } from '../types';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: CollaboratorItem[];
  onSaveCollaborators: (updated: CollaboratorItem[]) => void;
  businessName: string;
  defaultCommission: number;
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  onSaveCollaborators,
  businessName,
  defaultCommission,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [commission, setCommission] = useState<number>(defaultCommission || 40);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe el nombre del colaborador');
      return;
    }

    const newCollab: CollaboratorItem = {
      id: `collab-${Date.now().toString(36)}`,
      name: name.trim(),
      role: role.trim() || 'Especialista',
      phone: phone.trim(),
      commissionDefault: Number(commission) || 40,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onSaveCollaborators([...collaborators, newCollab]);
    setName('');
    setRole('');
    setPhone('');
    setCommission(defaultCommission || 40);
    setError(null);
  };

  const handleDeleteCollaborator = (id: string) => {
    onSaveCollaborators(collaborators.filter((c) => c.id !== id));
    setDeleteConfirmId(null);
  };

  const handleToggleActive = (id: string) => {
    onSaveCollaborators(
      collaborators.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Administrar Equipo de Colaboradores
              </h3>
              <p className="text-xs text-slate-300">
                Personal activo para <strong className="text-emerald-400">{businessName}</strong>
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

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Add Collaborator Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Agregar Nuevo Colaborador / Especialista</span>
            </h4>

            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddCollaborator} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej. Carlos Martínez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Especialidad / Puesto
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ej. Estilista Senior / Barbero"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="Ej. +504 9988-7766"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    % Comisión Predeterminado
                  </label>
                  <div className="relative">
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={commission}
                      onChange={(e) => setCommission(Number(e.target.value) || 0)}
                      className="w-full pl-8.5 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar Colaborador</span>
                </button>
              </div>
            </form>
          </div>

          {/* Collaborators List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Lista de Colaboradores Registrados ({collaborators.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                Alimentan el auto-completado del registro de ventas
              </span>
            </div>

            {collaborators.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  No hay colaboradores registrados todavía.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Agrega el primero arriba para autocompletar tus registros de ventas.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                      c.active ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{c.name}</span>
                          {!c.active && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                          <span>{c.role || 'Especialista'}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {c.commissionDefault}% comisión
                          </span>
                          {c.phone && (
                            <>
                              <span>•</span>
                              <span>{c.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c.id)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          c.active
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                        }`}
                        title={c.active ? 'Marcar como inactivo temporalmente' : 'Reactivar'}
                      >
                        {c.active ? 'Desactivar' : 'Activar'}
                      </button>

                      {deleteConfirmId === c.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                          <span className="text-[10px] text-rose-700 font-bold px-1">¿Borrar?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCollaborator(c.id)}
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
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
