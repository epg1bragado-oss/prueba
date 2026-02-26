import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  Sale, MONTHS, formatARS, formatUSD, formatDate, formatDateLong, daysUntil, Page,
} from '../types';
import {
  Plus, Edit2, Trash2, Search, X, Filter, Download, ChevronDown,
  Phone, Mail, ShieldCheck, Check, Package,
  Smartphone, AlertTriangle, Calendar, CreditCard, FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import RegisterSale from './RegisterSale';

interface Props {
  selectedMonth: number;
  onNavigate: (page: Page, month?: number) => void;
}

const MonthlySales: React.FC<Props> = ({ selectedMonth, onNavigate }) => {
  const { sales, updateSale, deleteSale, exchangeRate, setExchangeRate, isAuthenticated } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterPagado, setFilterPagado] = useState<string>('');
  const [filterEntregado, setFilterEntregado] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const monthSales = useMemo(() => {
    let filtered = sales.filter(s => s.month === selectedMonth);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.cliente.toLowerCase().includes(term) ||
        s.iphone.toLowerCase().includes(term) ||
        s.imei.includes(term) ||
        s.proveedor.toLowerCase().includes(term) ||
        s.color.toLowerCase().includes(term)
      );
    }
    if (filterEstado) filtered = filtered.filter(s => s.estado === filterEstado);
    if (filterPagado) filtered = filtered.filter(s => filterPagado === 'SI' ? s.pagado : !s.pagado);
    if (filterEntregado) filtered = filtered.filter(s => filterEntregado === 'SI' ? s.entregado : !s.entregado);
    return filtered.sort((a, b) => b.fechaVenta.localeCompare(a.fechaVenta));
  }, [sales, selectedMonth, searchTerm, filterEstado, filterPagado, filterEntregado]);

  const totals = useMemo(() => ({
    costoUSD: monthSales.reduce((s, v) => s + v.costoUSD, 0),
    costoARS: monthSales.reduce((s, v) => s + v.costoARS, 0),
    ventaUSD: monthSales.reduce((s, v) => s + v.ventaUSD, 0),
    ventaARS: monthSales.reduce((s, v) => s + v.ventaARS, 0),
    gananciaARS: monthSales.reduce((s, v) => s + v.gananciaARS, 0),
    pendientesCobro: monthSales.filter(s => !s.pagado).length,
    pendientesEntrega: monthSales.filter(s => !s.entregado).length,
  }), [monthSales]);

  const handleDelete = (id: string) => {
    deleteSale(id);
    setDeleteConfirm(null);
  };

  const togglePagado = (sale: Sale) => {
    updateSale(sale.id, { pagado: !sale.pagado });
  };

  const toggleEntregado = (sale: Sale) => {
    updateSale(sale.id, {
      entregado: !sale.entregado,
      fechaEntrega: !sale.entregado ? new Date().toISOString().split('T')[0] : '',
    });
  };

  const exportMonth = () => {
    const wsData = monthSales.map(s => ({
      'FECHA VENTA': s.fechaVenta,
      'GARANTIA': s.garantia,
      'PROVEEDOR': s.proveedor,
      'CLIENTE': s.cliente,
      'TELEFONO': s.clienteTelefono || '',
      'IPHONE': s.iphone,
      'ESTADO': s.estado,
      'CAPACIDAD': s.capacidad,
      'BATERIA %': s.bateria + '%',
      'COLOR': s.color,
      'COSTO USD': s.costoUSD,
      'COSTO ARS': s.costoARS,
      'VENTA USD': s.ventaUSD,
      'VENTA ARS': s.ventaARS,
      'GANANCIA ARS': s.gananciaARS,
      'PAGADO': s.pagado ? 'SI' : 'NO',
      'METODO PAGO': s.metodoPago || '',
      'ACCESORIOS': s.accesorios,
      'ENTREGADO': s.entregado ? 'SI' : 'NO',
      'IMEI': s.imei,
      'NOTAS': s.notas || '',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, MONTHS[selectedMonth]);
    XLSX.writeFile(wb, `Ventas_${MONTHS[selectedMonth]}_2026.xlsx`);
  };

  if (editingSale) {
    return (
      <div className="animate-fade-in">
        <RegisterSale
          onNavigate={onNavigate}
          editSale={editingSale}
          onClose={() => setEditingSale(null)}
        />
      </div>
    );
  }

  const activeFilters = [filterEstado, filterPagado, filterEntregado].filter(Boolean).length;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            {MONTHS[selectedMonth]} 2026
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">{monthSales.length} ventas registradas</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-400">TC:</span>
            <input
              type="number"
              value={exchangeRate}
              onChange={e => setExchangeRate(Number(e.target.value))}
              className="w-20 bg-transparent text-sm font-medium text-slate-800 dark:text-white focus:outline-none"
              disabled={!isAuthenticated}
            />
            <span className="text-xs text-slate-400">ARS/USD</span>
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('cards')} className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'cards' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              Tarjetas
            </button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              Tabla
            </button>
          </div>
          <button onClick={exportMonth} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Excel
          </button>
          {isAuthenticated && (
            <button onClick={() => onNavigate('register-sale')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 text-sm font-semibold transition-colors shadow-md shadow-primary-500/25">
              <Plus className="w-4 h-4" /> Nueva Venta
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-xs text-slate-400">Ventas</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{formatARS(totals.ventaARS)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-xs text-slate-400">Costos</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{formatARS(totals.costoARS)}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30 p-3">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Ganancia</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatARS(totals.gananciaARS)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <p className="text-xs text-slate-400">Equipos</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{monthSales.length}</p>
        </div>
        {totals.pendientesCobro > 0 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30 p-3">
            <p className="text-xs text-amber-600 dark:text-amber-400">Pend. Cobro</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{totals.pendientesCobro}</p>
          </div>
        )}
        {totals.pendientesEntrega > 0 && (
          <div className="bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/30 p-3">
            <p className="text-xs text-red-500">Pend. Entrega</p>
            <p className="text-lg font-bold text-red-500">{totals.pendientesEntrega}</p>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, modelo, IMEI, proveedor, color..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${activeFilters > 0 ? 'border-primary-300 dark:border-primary-500/50 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
          <Filter className="w-4 h-4" /> Filtros {activeFilters > 0 && `(${activeFilters})`} <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-fade-in">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos</option>
              <option value="NUEVO">Nuevo</option>
              <option value="USADO">Usado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Pagado</label>
            <select value={filterPagado} onChange={e => setFilterPagado(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos</option>
              <option value="SI">Pagado</option>
              <option value="NO">Pendiente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Entregado</label>
            <select value={filterEntregado} onChange={e => setFilterEntregado(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos</option>
              <option value="SI">Entregado</option>
              <option value="NO">Pendiente</option>
            </select>
          </div>
          {activeFilters > 0 && (
            <div className="flex items-end">
              <button onClick={() => { setFilterEstado(''); setFilterPagado(''); setFilterEntregado(''); }} className="text-xs text-primary-500 hover:text-primary-600 font-medium px-3 py-2">Limpiar filtros</button>
            </div>
          )}
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {monthSales.map(sale => {
            const isExpanded = expandedSale === sale.id;
            const warrantyDays = daysUntil(sale.garantia);
            const warrantyExpired = warrantyDays < 0;
            const warrantySoon = warrantyDays >= 0 && warrantyDays <= 7;
            return (
              <div key={sale.id} className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-primary-300 dark:border-primary-500/50 shadow-lg' : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'}`}>
                {/* Card Header */}
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedSale(isExpanded ? null : sale.id)}>
                  {/* iPhone Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${sale.estado === 'NUEVO' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'} text-white shadow-md`}>
                    <Smartphone className="w-7 h-7" />
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 dark:text-white">iPhone {sale.iphone}</h4>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${sale.estado === 'NUEVO' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>{sale.estado}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs">{sale.capacidad >= 1024 ? '1TB' : `${sale.capacidad}GB`}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs">{sale.color}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">👤 {sale.cliente}</span>
                      <span>📅 {formatDate(sale.fechaVenta)}</span>
                      {sale.proveedor && <span className="hidden sm:inline">🏪 {sale.proveedor}</span>}
                    </div>
                  </div>

                  {/* Status Badges & Price */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${sale.pagado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-red-100 dark:bg-red-500/20 text-red-500'}`} title={sale.pagado ? 'Pagado' : 'No pagado'}>
                        {sale.pagado ? '💰' : '⏳'}
                      </span>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${sale.entregado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-red-100 dark:bg-red-500/20 text-red-500'}`} title={sale.entregado ? 'Entregado' : 'No entregado'}>
                        {sale.entregado ? '📦' : '🔜'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatARS(sale.gananciaARS)}</p>
                      <p className="text-xs text-slate-400">{formatUSD(sale.ventaUSD)}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Client Details */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2">
                        <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cliente</h5>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">{sale.cliente}</p>
                        {sale.clienteTelefono && (
                          <a href={`tel:${sale.clienteTelefono}`} className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600">
                            <Phone className="w-3 h-3" /> {sale.clienteTelefono}
                          </a>
                        )}
                        {sale.clienteEmail && (
                          <a href={`mailto:${sale.clienteEmail}`} className="flex items-center gap-1.5 text-xs text-primary-500 hover:text-primary-600">
                            <Mail className="w-3 h-3" /> {sale.clienteEmail}
                          </a>
                        )}
                      </div>

                      {/* Equipment Details */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2">
                        <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Equipo</h5>
                        <p className="font-semibold text-slate-800 dark:text-white text-sm">iPhone {sale.iphone}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{sale.capacidad >= 1024 ? '1TB' : `${sale.capacidad}GB`}</span>·
                          <span>{sale.color}</span>·
                          <span>{sale.estado}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500">🔋</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                            <div className={`h-full rounded-full ${sale.bateria >= 80 ? 'bg-emerald-500' : sale.bateria >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${sale.bateria}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{sale.bateria}%</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">IMEI: {sale.imei}</p>
                      </div>

                      {/* Financial Details */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2">
                        <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Financiero</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Costo:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{formatUSD(sale.costoUSD)} / {formatARS(sale.costoARS)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Venta:</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{formatUSD(sale.ventaUSD)} / {formatARS(sale.ventaARS)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-1">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ganancia:</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatARS(sale.gananciaARS)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">{sale.metodoPago || 'Sin especificar'}</span>
                        </div>
                      </div>

                      {/* Dates & Status */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 space-y-2">
                        <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fechas y Estado</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-300">📅 Venta: {formatDateLong(sale.fechaVenta)}</p>
                        <div className={`flex items-center gap-1.5 text-sm ${warrantyExpired ? 'text-red-500' : warrantySoon ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Garantía: {formatDate(sale.garantia)}</span>
                          {warrantySoon && <AlertTriangle className="w-3 h-3" />}
                        </div>
                        {sale.fechaEntrega && <p className="text-sm text-slate-600 dark:text-slate-300">📦 Entrega: {formatDate(sale.fechaEntrega)}</p>}
                        {sale.proveedor && <p className="text-sm text-slate-600 dark:text-slate-300">🏪 {sale.proveedor}</p>}
                      </div>
                    </div>

                    {/* Accessories & Notes */}
                    {(sale.accesorios || sale.notas) && (
                      <div className="flex flex-wrap gap-4">
                        {sale.accesorios && (
                          <div className="flex items-start gap-2">
                            <Package className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Accesorios</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sale.accesorios.split(', ').map((acc, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 text-xs">{acc}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {sale.notas && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase">Notas</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300 italic mt-0.5">"{sale.notas}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    {isAuthenticated && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex-wrap">
                        <button onClick={() => togglePagado(sale)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sale.pagado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-700'}`}>
                          <Check className="w-3 h-3" /> {sale.pagado ? 'Pagado ✓' : 'Marcar Pagado'}
                        </button>
                        <button onClick={() => toggleEntregado(sale)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sale.entregado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-700'}`}>
                          <Package className="w-3 h-3" /> {sale.entregado ? 'Entregado ✓' : 'Marcar Entregado'}
                        </button>
                        <div className="flex-1" />
                        <button onClick={() => setEditingSale(sale)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-300 text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={() => setDeleteConfirm(sale.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  {['Fecha', 'Garantía', 'Proveedor', 'Cliente', 'iPhone', 'Estado', 'Cap.', 'Bat.', 'Color', 'Costo USD', 'Costo ARS', 'Venta USD', 'Venta ARS', 'Ganancia', 'Pagado', 'Entregado', 'IMEI', ''].map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {monthSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300">{formatDate(sale.fechaVenta)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-500 dark:text-slate-400">{formatDate(sale.garantia)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300">{sale.proveedor}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-medium text-slate-800 dark:text-white">{sale.cliente}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><span className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-xs font-medium">{sale.iphone}</span></td>
                    <td className="px-3 py-2.5 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-md text-xs font-medium ${sale.estado === 'NUEVO' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>{sale.estado}</span></td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-400">{sale.capacidad}GB</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                          <div className={`h-full rounded-full ${sale.bateria >= 80 ? 'bg-emerald-500' : sale.bateria >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${sale.bateria}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{sale.bateria}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-400">{sale.color}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono">{formatUSD(sale.costoUSD)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono">{formatARS(sale.costoARS)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono">{formatUSD(sale.ventaUSD)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-mono">{formatARS(sale.ventaARS)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatARS(sale.gananciaARS)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-center">
                      {isAuthenticated ? (
                        <button onClick={() => togglePagado(sale)} className={`w-6 h-6 rounded-full text-xs font-bold ${sale.pagado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-red-100 dark:bg-red-500/20 text-red-600'}`}>
                          {sale.pagado ? '✓' : '✗'}
                        </button>
                      ) : (
                        <span className={`inline-block w-5 h-5 rounded-full text-xs leading-5 font-bold ${sale.pagado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-red-100 dark:bg-red-500/20 text-red-600'}`}>{sale.pagado ? '✓' : '✗'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-center">
                      {isAuthenticated ? (
                        <button onClick={() => toggleEntregado(sale)} className={`w-6 h-6 rounded-full text-xs font-bold ${sale.entregado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-red-100 dark:bg-red-500/20 text-red-600'}`}>
                          {sale.entregado ? '✓' : '✗'}
                        </button>
                      ) : (
                        <span className={`inline-block w-5 h-5 rounded-full text-xs leading-5 font-bold ${sale.entregado ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-red-100 dark:bg-red-500/20 text-red-600'}`}>{sale.entregado ? '✓' : '✗'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-xs">{sale.imei}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {isAuthenticated && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditingSale(sale)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 text-primary-500 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteConfirm(sale.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {monthSales.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-t-2 border-slate-300 dark:border-slate-600 font-semibold">
                    <td colSpan={9} className="px-3 py-3 text-slate-700 dark:text-slate-300">TOTALES ({monthSales.length} ventas)</td>
                    <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">{formatUSD(totals.costoUSD)}</td>
                    <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">{formatARS(totals.costoARS)}</td>
                    <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">{formatUSD(totals.ventaUSD)}</td>
                    <td className="px-3 py-3 font-mono text-slate-700 dark:text-slate-300">{formatARS(totals.ventaARS)}</td>
                    <td className="px-3 py-3 font-mono text-emerald-600 dark:text-emerald-400">{formatARS(totals.gananciaARS)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {monthSales.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center py-16">
          <Smartphone className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-1">No hay ventas en {MONTHS[selectedMonth]}</p>
          <p className="text-sm text-slate-400 mb-4">Registra tu primera venta del mes</p>
          {isAuthenticated && (
            <button onClick={() => onNavigate('register-sale')} className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/25">
              <Plus className="w-4 h-4 inline mr-2" /> Registrar Venta
            </button>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">¿Eliminar venta?</h3>
              <p className="text-sm text-slate-400 mb-6">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm font-semibold transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlySales;
