import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { MONTHS, formatARS, formatUSD, formatDate, Page } from '../types';
import { Search, X, Smartphone, Clock, FileText, ArrowRight } from 'lucide-react';

interface Props {
  onNavigate: (page: Page, month?: number) => void;
}

const GlobalSearch: React.FC<Props> = ({ onNavigate }) => {
  const { sales, changeLogs } = useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const term = query.toLowerCase();
    return sales.filter(s =>
      s.cliente.toLowerCase().includes(term) ||
      s.imei.includes(term) ||
      s.iphone.toLowerCase().includes(term) ||
      s.proveedor.toLowerCase().includes(term) ||
      s.color.toLowerCase().includes(term)
    ).slice(0, 50);
  }, [sales, query]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Búsqueda Global</h2>
        <p className="text-sm text-slate-400">Busca por IMEI, cliente, modelo o proveedor en todos los meses</p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Escribe al menos 2 caracteres para buscar..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Results */}
      {query.length >= 2 && (
        <div>
          <p className="text-sm text-slate-400 mb-4">{results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</p>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(sale => (
                <div
                  key={sale.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-300 dark:hover:border-primary-500/50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => onNavigate('monthly-sales', sale.month)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-800 dark:text-white">iPhone {sale.iphone}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${sale.estado === 'NUEVO' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>{sale.estado}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">{sale.capacidad}GB</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">{sale.color}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <span>👤 {sale.cliente}</span>
                        <span>📅 {formatDate(sale.fechaVenta)}</span>
                        <span>🏪 {sale.proveedor}</span>
                        <span className="font-mono text-xs">IMEI: {sale.imei}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Venta</p>
                        <p className="font-semibold text-slate-800 dark:text-white">{formatUSD(sale.ventaUSD)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Ganancia</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatARS(sale.gananciaARS)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-primary-500">
                        <span className="text-xs font-medium">{MONTHS[sale.month]}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No se encontraron resultados</p>
              <p className="text-sm text-slate-400 mt-1">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Change Log Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Actividad Reciente</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {changeLogs.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-96 overflow-y-auto">
              {changeLogs.slice(0, 20).map(log => (
                <div key={log.id} className="px-5 py-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    log.action === 'CREAR' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                    log.action === 'EDITAR' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' :
                    'bg-red-100 dark:bg-red-500/20 text-red-600'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        log.action === 'CREAR' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                        log.action === 'EDITAR' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                        'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                      }`}>{log.action}</span>
                      <span className="text-xs text-slate-400">{log.entity}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 truncate">{log.details}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12">No hay registros de actividad</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
