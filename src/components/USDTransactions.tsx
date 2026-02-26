import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { USDTransaction, OPERATIONS, formatARS, formatNumber, formatDate } from '../types';
import { Plus, Edit2, Trash2, Search, X, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const emptyTx = (): Omit<USDTransaction, 'id' | 'ganancia'> => ({
  fecha: new Date().toISOString().split('T')[0],
  cliente: '',
  clienteVenta: '',
  cantidad: 0,
  precioCosto: 0,
  precioVenta: 0,
  costoPesos: 0,
  ventaPesos: 0,
  operacion: 'TRANSFERENCIA',
});

const USDTransactions: React.FC = () => {
  const { usdTransactions, addUSDTransaction, updateUSDTransaction, deleteUSDTransaction, isAuthenticated } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyTx());
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchTerm) return usdTransactions;
    const term = searchTerm.toLowerCase();
    return usdTransactions.filter(t =>
      t.cliente.toLowerCase().includes(term) ||
      t.clienteVenta.toLowerCase().includes(term) ||
      t.operacion.toLowerCase().includes(term)
    );
  }, [usdTransactions, searchTerm]);

  const totals = useMemo(() => ({
    cantidad: filtered.reduce((s, t) => s + t.cantidad, 0),
    costoPesos: filtered.reduce((s, t) => s + t.costoPesos, 0),
    ventaPesos: filtered.reduce((s, t) => s + t.ventaPesos, 0),
    ganancia: filtered.reduce((s, t) => s + t.ganancia, 0),
  }), [filtered]);

  const openAdd = () => {
    setFormData(emptyTx());
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (tx: USDTransaction) => {
    setFormData({ ...tx });
    setEditingId(tx.id);
    setShowForm(true);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      updated.costoPesos = updated.cantidad * updated.precioCosto;
      updated.ventaPesos = updated.cantidad * updated.precioVenta;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente.trim()) return;
    if (editingId) {
      updateUSDTransaction(editingId, formData);
    } else {
      addUSDTransaction(formData);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteUSDTransaction(id);
    setDeleteConfirm(null);
  };

  const exportToExcel = () => {
    const data = usdTransactions.map(t => ({
      'FECHA': t.fecha,
      'CLIENTE': t.cliente,
      'CLIENTE VENTA': t.clienteVenta,
      'CANTIDAD USD': t.cantidad,
      'PRECIO COSTO': t.precioCosto,
      'PRECIO VENTA': t.precioVenta,
      'COSTO PESOS': t.costoPesos,
      'VENTA PESOS': t.ventaPesos,
      'GANANCIA': t.ganancia,
      'OPERACION': t.operacion,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones USD');
    XLSX.writeFile(wb, 'Transacciones_USD_2026.xlsx');
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all";
  const labelClass = "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Transacciones USD</h2>
          <p className="text-sm text-slate-400">{usdTransactions.length} operaciones registradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
          {isAuthenticated && (
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 text-sm font-semibold transition-colors shadow-md shadow-primary-500/25">
              <Plus className="w-4 h-4" /> Nueva Transacción
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por cliente, operación..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400" /></button>}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                {['Fecha', 'Cliente', 'Cliente Venta', 'Cantidad USD', 'Precio Costo', 'Precio Venta', 'Costo Pesos', 'Venta Pesos', 'Ganancia', 'Operación', ''].map((h, i) => (
                  <th key={i} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300">{formatDate(tx.fecha)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-800 dark:text-white">{tx.cliente}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300">{tx.clienteVenta}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">{formatNumber(tx.cantidad)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">{formatARS(tx.precioCosto)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">{formatARS(tx.precioVenta)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">{formatARS(tx.costoPesos)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">{formatARS(tx.ventaPesos)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatARS(tx.ganancia)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-medium">{tx.operacion}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {isAuthenticated && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteConfirm(tx.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-300 dark:border-slate-600 font-semibold">
                  <td colSpan={3} className="px-3 py-3 text-slate-700 dark:text-slate-300">TOTALES</td>
                  <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">{formatNumber(totals.cantidad)}</td>
                  <td colSpan={2}></td>
                  <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">{formatARS(totals.costoPesos)}</td>
                  <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">{formatARS(totals.ventaPesos)}</td>
                  <td className="px-3 py-3 font-mono text-emerald-600 dark:text-emerald-400">{formatARS(totals.ganancia)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No hay transacciones registradas</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingId ? 'Editar Transacción' : 'Nueva Transacción USD'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Fecha *</label>
                  <input type="date" value={formData.fecha} onChange={e => handleChange('fecha', e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Operación</label>
                  <select value={formData.operacion} onChange={e => handleChange('operacion', e.target.value)} className={inputClass}>
                    {OPERATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cliente (Compra) *</label>
                  <input type="text" value={formData.cliente} onChange={e => handleChange('cliente', e.target.value)} className={inputClass} required placeholder="Origen de los USD" />
                </div>
                <div>
                  <label className={labelClass}>Cliente (Venta)</label>
                  <input type="text" value={formData.clienteVenta} onChange={e => handleChange('clienteVenta', e.target.value)} className={inputClass} placeholder="Destino de los USD" />
                </div>
                <div>
                  <label className={labelClass}>Cantidad USD</label>
                  <input type="number" min="0" value={formData.cantidad} onChange={e => handleChange('cantidad', Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Precio Costo (ARS/USD)</label>
                  <input type="number" min="0" step="0.01" value={formData.precioCosto} onChange={e => handleChange('precioCosto', Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Precio Venta (ARS/USD)</label>
                  <input type="number" min="0" step="0.01" value={formData.precioVenta} onChange={e => handleChange('precioVenta', Number(e.target.value))} className={inputClass} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 space-y-1">
                <p className="text-sm text-slate-600 dark:text-slate-300">Costo Pesos: <span className="font-semibold">{formatARS(formData.cantidad * formData.precioCosto)}</span></p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Venta Pesos: <span className="font-semibold">{formatARS(formData.cantidad * formData.precioVenta)}</span></p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Ganancia: {formatARS(formData.cantidad * (formData.precioVenta - formData.precioCosto))}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 text-sm font-semibold transition-colors shadow-md shadow-primary-500/25">
                  {editingId ? 'Guardar Cambios' : 'Agregar Transacción'}
                </button>
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">¿Eliminar transacción?</h3>
              <p className="text-sm text-slate-400 mb-6">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm font-semibold transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default USDTransactions;
