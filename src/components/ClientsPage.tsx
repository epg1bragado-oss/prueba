import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Client, Page } from '../types';
import {
  Plus, Edit2, Trash2, Search, X, Phone, Mail, MapPin, User,
  Instagram, FileText, Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  onNavigate: (page: Page, month?: number) => void;
}

const ClientsPage: React.FC<Props> = (_props) => {
  const { clients, sales, addClient, updateClient, deleteClient, isAuthenticated } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '', direccion: '', instagram: '', notas: '' });

  const filtered = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.telefono.includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.direccion.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  const getClientSalesCount = (nombre: string) => sales.filter(s => s.cliente === nombre).length;
  const getClientTotalSpent = (nombre: string) => sales.filter(s => s.cliente === nombre).reduce((sum, s) => sum + s.ventaARS, 0);

  const openAdd = () => {
    setFormData({ nombre: '', telefono: '', email: '', direccion: '', instagram: '', notas: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setFormData({ nombre: client.nombre, telefono: client.telefono, email: client.email, direccion: client.direccion, instagram: client.instagram, notas: client.notas });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    if (editingId) {
      updateClient(editingId, formData);
    } else {
      addClient(formData);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    setDeleteConfirm(null);
  };

  const exportClients = () => {
    const data = clients.map(c => ({
      'NOMBRE': c.nombre,
      'TELEFONO': c.telefono,
      'EMAIL': c.email,
      'DIRECCION': c.direccion,
      'INSTAGRAM': c.instagram,
      'NOTAS': c.notas,
      'COMPRAS': getClientSalesCount(c.nombre),
      'FECHA REGISTRO': c.createdAt,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Clientes');
    XLSX.writeFile(wb, 'Clientes_2026.xlsx');
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-primary-500" /> Agenda de Clientes
          </h2>
          <p className="text-sm text-slate-400">{clients.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportClients} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Excel
          </button>
          {isAuthenticated && (
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 text-sm font-semibold transition-colors shadow-md shadow-primary-500/25">
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Buscar por nombre, teléfono, email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400" /></button>}
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => {
          const salesCount = getClientSalesCount(client.nombre);
          const totalSpent = getClientTotalSpent(client.nombre);
          return (
            <div key={client.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {client.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-white truncate">{client.nombre}</h4>
                  <div className="space-y-1 mt-2">
                    {client.telefono && (
                      <a href={`tel:${client.telefono}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-500 transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {client.telefono}
                      </a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-500 transition-colors truncate">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {client.email}
                      </a>
                    )}
                    {client.instagram && (
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Instagram className="w-3.5 h-3.5" /> {client.instagram}
                      </p>
                    )}
                    {client.direccion && (
                      <p className="flex items-center gap-1.5 text-sm text-slate-500 truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {client.direccion}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats & Notes */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Compras</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{salesCount}</p>
                  </div>
                  {salesCount > 0 && (
                    <div className="flex-1 text-right">
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0, notation: 'compact' }).format(totalSpent)}</p>
                    </div>
                  )}
                </div>
                {client.notas && (
                  <p className="text-xs text-slate-400 italic mt-2 flex items-start gap-1">
                    <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" /> {client.notas}
                  </p>
                )}
              </div>

              {/* Actions */}
              {isAuthenticated && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                  <button onClick={() => openEdit(client)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button onClick={() => setDeleteConfirm(client.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center py-16">
          <User className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No se encontraron clientes</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Nombre Completo *</label>
                <input type="text" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} className={inputClass} placeholder="Juan García" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input type="tel" value={formData.telefono} onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))} className={inputClass} placeholder="+54 11 5555-0000" />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="email@ejemplo.com" />
                </div>
                <div>
                  <label className={labelClass}>Instagram</label>
                  <input type="text" value={formData.instagram} onChange={e => setFormData(p => ({ ...p, instagram: e.target.value }))} className={inputClass} placeholder="@usuario" />
                </div>
                <div>
                  <label className={labelClass}>Dirección</label>
                  <input type="text" value={formData.direccion} onChange={e => setFormData(p => ({ ...p, direccion: e.target.value }))} className={inputClass} placeholder="Barrio, Ciudad" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Notas</label>
                <textarea value={formData.notas} onChange={e => setFormData(p => ({ ...p, notas: e.target.value }))} className={`${inputClass} resize-none`} rows={2} placeholder="Observaciones..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold transition-colors shadow-md shadow-primary-500/25">{editingId ? 'Guardar' : 'Crear Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">¿Eliminar cliente?</h3>
              <p className="text-sm text-slate-400 mb-6">Se eliminará de la agenda.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
