import React, { useMemo } from 'react';
import { useStore } from '../store';
import { MONTHS, MONTHS_SHORT, formatARS, formatUSD, formatNumber } from '../types';
import { Download, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];

const AnnualSummary: React.FC = () => {
  const { sales, usdTransactions, darkMode } = useStore();

  const monthlyData = useMemo(() =>
    MONTHS.map((name, i) => {
      const ms = sales.filter(s => s.month === i);
      return {
        name: MONTHS_SHORT[i],
        fullName: name,
        transacciones: ms.length,
        costoUSD: ms.reduce((s, v) => s + v.costoUSD, 0),
        costoARS: ms.reduce((s, v) => s + v.costoARS, 0),
        ventaUSD: ms.reduce((s, v) => s + v.ventaUSD, 0),
        ventaARS: ms.reduce((s, v) => s + v.ventaARS, 0),
        gananciaARS: ms.reduce((s, v) => s + v.gananciaARS, 0),
      };
    })
  , [sales]);

  const annualTotals = useMemo(() => ({
    transacciones: sales.length,
    costoUSD: sales.reduce((s, v) => s + v.costoUSD, 0),
    costoARS: sales.reduce((s, v) => s + v.costoARS, 0),
    ventaUSD: sales.reduce((s, v) => s + v.ventaUSD, 0),
    ventaARS: sales.reduce((s, v) => s + v.ventaARS, 0),
    gananciaARS: sales.reduce((s, v) => s + v.gananciaARS, 0),
    usdGanancia: usdTransactions.reduce((s, v) => s + v.ganancia, 0),
  }), [sales, usdTransactions]);

  // Cumulative profit data
  const cumulativeData = useMemo(() => {
    let cum = 0;
    return monthlyData.map(m => {
      cum += m.gananciaARS;
      return { name: m.name, gananciaAcumulada: cum };
    });
  }, [monthlyData]);

  // Model distribution
  const modelData = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(s => { counts[s.iphone] = (counts[s.iphone] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: `iPhone ${name}`, value })).sort((a, b) => b.value - a.value);
  }, [sales]);

  // State distribution
  const stateData = useMemo(() => {
    const nuevo = sales.filter(s => s.estado === 'NUEVO').length;
    const usado = sales.filter(s => s.estado === 'USADO').length;
    return [
      { name: 'Nuevo', value: nuevo },
      { name: 'Usado', value: usado },
    ];
  }, [sales]);

  const exportFullExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = monthlyData.map(m => ({
      'MES': m.fullName,
      'TRANSACCIONES': m.transacciones,
      'COSTO USD': m.costoUSD,
      'COSTO ARS': m.costoARS,
      'VENTA USD': m.ventaUSD,
      'VENTA ARS': m.ventaARS,
      'GANANCIA ARS': m.gananciaARS,
    }));
    summaryData.push({
      'MES': 'TOTAL',
      'TRANSACCIONES': annualTotals.transacciones,
      'COSTO USD': annualTotals.costoUSD,
      'COSTO ARS': annualTotals.costoARS,
      'VENTA USD': annualTotals.ventaUSD,
      'VENTA ARS': annualTotals.ventaARS,
      'GANANCIA ARS': annualTotals.gananciaARS,
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'RESUMEN');

    // Monthly sheets
    MONTHS.forEach((monthName, i) => {
      const ms = sales.filter(s => s.month === i);
      if (ms.length > 0) {
        const data = ms.map(s => ({
          'FECHA VENTA': s.fechaVenta, 'GARANTIA': s.garantia, 'PROVEEDOR': s.proveedor,
          'CLIENTE': s.cliente, 'IPHONE': s.iphone, 'ESTADO': s.estado,
          'CAPACIDAD': s.capacidad, 'BATERIA %': s.bateria + '%', 'COLOR': s.color,
          'COSTO USD': s.costoUSD, 'COSTO ARS': s.costoARS,
          'VENTA USD': s.ventaUSD, 'VENTA ARS': s.ventaARS,
          'GANANCIA ARS': s.gananciaARS, 'PAGADO': s.pagado ? 'SI' : 'NO',
          'ACCESORIOS': s.accesorios, 'ENTREGADO': s.entregado ? 'SI' : 'NO',
          'IMEI': s.imei,
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), monthName.substring(0, 10));
      }
    });

    // USD Transactions
    if (usdTransactions.length > 0) {
      const usdData = usdTransactions.map(t => ({
        'FECHA': t.fecha, 'CLIENTE': t.cliente, 'CLIENTE VENTA': t.clienteVenta,
        'CANTIDAD': t.cantidad, 'PRECIO COSTO': t.precioCosto, 'PRECIO VENTA': t.precioVenta,
        'COSTO PESOS': t.costoPesos, 'VENTA PESOS': t.ventaPesos,
        'GANANCIA': t.ganancia, 'OPERACION': t.operacion,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usdData), 'TRANS USD');
    }

    XLSX.writeFile(wb, 'Control_iPhone_2026_COMPLETO.xlsx');
  };

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
    borderRadius: '12px',
    color: darkMode ? '#e2e8f0' : '#1e293b',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Resumen Anual 2026</h2>
          <p className="text-sm text-slate-400">Vista completa del rendimiento anual</p>
        </div>
        <button onClick={exportFullExcel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-semibold transition-colors shadow-md shadow-emerald-500/25">
          <Download className="w-4 h-4" /> Exportar Excel Completo
        </button>
      </div>

      {/* Annual KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center"><DollarSign className="w-6 h-6 text-blue-500" /></div>
          <div>
            <p className="text-sm text-slate-400">Ventas Totales</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{formatARS(annualTotals.ventaARS)}</p>
            <p className="text-xs text-slate-400">{formatUSD(annualTotals.ventaUSD)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-emerald-500" /></div>
          <div>
            <p className="text-sm text-slate-400">Ganancias iPhones + USD</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatARS(annualTotals.gananciaARS + annualTotals.usdGanancia)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-violet-500" /></div>
          <div>
            <p className="text-sm text-slate-400">Total Operaciones</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{formatNumber(annualTotals.transacciones + usdTransactions.length)}</p>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Resumen por Mes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                {['Mes', 'Trans.', 'Costo USD', 'Costo ARS', 'Venta USD', 'Venta ARS', 'Ganancia ARS', 'Margen %'].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {monthlyData.map((m, i) => {
                const margin = m.ventaARS > 0 ? (m.gananciaARS / m.ventaARS * 100) : 0;
                return (
                  <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${m.transacciones === 0 ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{m.fullName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.transacciones}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{formatUSD(m.costoUSD)}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{formatARS(m.costoARS)}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatUSD(m.ventaUSD)}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">{formatARS(m.ventaARS)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatARS(m.gananciaARS)}</td>
                    <td className="px-4 py-3">
                      {m.transacciones > 0 && (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${margin >= 20 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                          {margin.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-700/50 border-t-2 border-slate-300 dark:border-slate-600 font-bold">
                <td className="px-4 py-3 text-slate-800 dark:text-white">TOTAL ANUAL</td>
                <td className="px-4 py-3 text-slate-800 dark:text-white">{annualTotals.transacciones}</td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-white">{formatUSD(annualTotals.costoUSD)}</td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-white">{formatARS(annualTotals.costoARS)}</td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-white">{formatUSD(annualTotals.ventaUSD)}</td>
                <td className="px-4 py-3 font-mono text-slate-800 dark:text-white">{formatARS(annualTotals.ventaARS)}</td>
                <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400">{formatARS(annualTotals.gananciaARS)}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    {annualTotals.ventaARS > 0 ? (annualTotals.gananciaARS / annualTotals.ventaARS * 100).toFixed(1) : 0}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cumulative Profit */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Ganancia Acumulada</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatARS(Number(value))} />
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="gananciaAcumulada" name="Ganancia Acumulada" stroke="#10b981" fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Ganancia por Mes</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatARS(Number(value))} />
                <Bar dataKey="gananciaARS" name="Ganancia" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Distribución por Modelo</h3>
          {modelData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-60 w-60 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={modelData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                      {modelData.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {modelData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{item.value} ({(item.value / sales.length * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-16">Sin datos</p>
          )}
        </div>

        {/* New vs Used */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Nuevo vs Usado</h3>
          {stateData.some(d => d.value > 0) ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-60 w-60 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stateData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-4 w-full">
                {stateData.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 0 ? '#10b981' : '#f59e0b' }} />
                      <span className="font-medium text-slate-800 dark:text-white">{item.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</p>
                    <p className="text-sm text-slate-400">{sales.length > 0 ? (item.value / sales.length * 100).toFixed(1) : 0}% del total</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-16">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnualSummary;
