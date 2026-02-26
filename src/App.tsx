import React, { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { Page } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MonthlySales from './components/MonthlySales';
import RegisterSale from './components/RegisterSale';
import USDTransactions from './components/USDTransactions';
import AnnualSummary from './components/AnnualSummary';
import GlobalSearch from './components/GlobalSearch';
import ClientsPage from './components/ClientsPage';
import { FileText, Clock } from 'lucide-react';

const ChangeLogPage: React.FC = () => {
  const { changeLogs } = useStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Log de Cambios</h2>
        <p className="text-sm text-slate-400">Registro de auditoría de todas las operaciones</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {changeLogs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {changeLogs.map(log => (
              <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  log.action === 'CREAR' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                  log.action === 'EDITAR' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600' :
                  'bg-red-100 dark:bg-red-500/20 text-red-600'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      log.action === 'CREAR' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                      log.action === 'EDITAR' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' :
                      'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                    }`}>{log.action}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium">{log.entity}</span>
                    <span className="text-xs text-slate-400 font-mono">ID: {log.entityId.substring(0, 8)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{log.details}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleString('es-AR')}</span>
                    <span>·</span>
                    <span>Usuario: {log.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No hay registros de cambios</p>
            <p className="text-sm text-slate-400 mt-1">Los cambios se registrarán aquí automáticamente</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const handleNavigate = (page: Page, month?: number) => {
    setCurrentPage(page);
    if (month !== undefined) setSelectedMonth(month);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'register-sale':
        return <RegisterSale onNavigate={handleNavigate} />;
      case 'monthly-sales':
        return <MonthlySales selectedMonth={selectedMonth} onNavigate={handleNavigate} />;
      case 'usd-transactions':
        return <USDTransactions />;
      case 'annual-summary':
        return <AnnualSummary />;
      case 'global-search':
        return <GlobalSearch onNavigate={handleNavigate} />;
      case 'clients':
        return <ClientsPage onNavigate={handleNavigate} />;
      case 'change-log':
        return <ChangeLogPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} selectedMonth={selectedMonth} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
