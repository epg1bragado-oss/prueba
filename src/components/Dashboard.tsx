import React from 'react';
import { useStore } from '../store';
import { MONTHS_SHORT, formatARS, formatNumber, Page } from '../types';
import { TrendingUp, DollarSign, ShoppingCart, BarChart3, AlertTriangle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];

interface Props {
  onNavigate: (page: Page, month?: number) => void;
}

const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  const { sales, usdTransactions, darkMode } = useStore();

  const monthlyData = MONTHS_SHORT.map((name, i) => {
    const monthSales = sales.filter(s => s.month === i);
    return {
      name,
      monthIndex: i,
      ventas: monthSales.reduce((sum, s) => sum + s.ventaARS, 0),
      costos: monthSales.reduce((sum, s) => sum + s.costoARS, 0),
      ganancias: monthSales.reduce((sum, s) => sum + s.gananciaARS, 0),
      count: monthSales.length,
    };
  });

  const totalVentas = sales.reduce((sum, s) => sum + s.ventaARS, 0);
  const totalGanancias = sales.reduce((sum, s) => sum + s.gananciaARS, 0);
  const totalTransactions = sales.length;
  const avgProfit = totalTransactions > 0 ? totalGanancias / totalTransactions : 0;
  const totalUSDGanancia = usdTransactions.reduce((sum, t) => sum + t.ganancia, 0);

  // Model distribution
  const modelCounts: Record<string, number> = {};
  sales.forEach(s => {
    const model = `iPhone ${s.iphone}`;
    modelCounts[model] = (modelCounts[model] || 0) + 1;
  });
  const modelData = Object.entries(modelCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Warranty alerts
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const warrantyAlerts = sales.filter(s => {
    const gDate = new Date(s.garantia + 'T12:00:00');
    return gDate >= today && gDate <= nextWeek;
  });

  // Recent sales
  const recentSales = [...sales]
    .sort((a, b) => b.fechaVenta.localeCompare(a.fechaVenta))
    .slice(0, 5);

  const tooltipStyle = {
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
    borderRadius: '12px',
    color: darkMode ? '#e2e8f0' : '#1e293b',
  };

  const kpis = [
    { label: 'Total Ventas', value: formatARS(totalVentas), icon: <DollarSign className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/25' },
    { label: 'Total Ganancias', value: formatARS(totalGanancias), icon: <TrendingUp className="w-5 h-5" />, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/25' },
    { label: 'Transacciones', value: formatNumber(totalTransactions), icon: <ShoppingCart className="w-5 h-5" />, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/25' },
    { label: 'Ganancia Promedio', value: formatARS(avgProfit), icon: <BarChart3 className="w-5 h-5" />, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/25' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${kpi.color} p-5 text-white shadow-lg ${kpi.shadow}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                {kpi.icon}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Ventas vs Costos vs Ganancias por Mes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatARS(Number(value))} />
                <Bar dataKey="costos" name="Costos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ventas" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ganancias" name="Ganancias" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Distribución por Modelo</h3>
          {modelData.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={modelData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={3} dataKey="value">
                      {modelData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
                {modelData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-center py-16">Sin datos</p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Ventas Recientes</h3>
            <button
              onClick={() => onNavigate('monthly-sales', new Date().getMonth())}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentSales.map(sale => (
              <div key={sale.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs">
                  {sale.iphone.split(' ')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white text-sm truncate">iPhone {sale.iphone} - {sale.capacidad}GB</p>
                  <p className="text-xs text-slate-400 truncate">{sale.cliente} · {sale.fechaVenta}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{formatARS(sale.gananciaARS)}</p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <p className="text-slate-400 text-center py-8">No hay ventas registradas</p>
            )}
          </div>
        </div>

        {/* Alerts & USD Summary */}
        <div className="space-y-6">
          {/* Warranty Alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Garantías Próximas a Vencer
            </h3>
            {warrantyAlerts.length > 0 ? (
              <div className="space-y-2">
                {warrantyAlerts.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">iPhone {sale.iphone} - {sale.cliente}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Vence: {sale.garantia}</p>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6 text-sm">No hay garantías por vencer esta semana</p>
            )}
          </div>

          {/* USD Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Transacciones USD</h3>
              <button onClick={() => onNavigate('usd-transactions')} className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                Ver todas <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <p className="text-sm text-slate-400">Operaciones</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{usdTransactions.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <p className="text-sm text-slate-400">Ganancia Total</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatARS(totalUSDGanancia)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
