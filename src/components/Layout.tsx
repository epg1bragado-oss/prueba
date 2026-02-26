import React, { useState } from 'react';
import { useStore } from '../store';
import { MONTHS, Page } from '../types';
import {
  LayoutDashboard, Calendar, DollarSign, BarChart3, Search,
  FileText, Sun, Moon, LogOut, Lock, Unlock, Menu, X, ChevronDown, ChevronRight,
  Smartphone, PlusCircle, Users,
} from 'lucide-react';

interface LayoutProps {
  currentPage: Page;
  selectedMonth: number;
  onNavigate: (page: Page, month?: number) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentPage, selectedMonth, onNavigate, children }) => {
  const { darkMode, toggleDarkMode, isAuthenticated, logout, login } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [monthsExpanded, setMonthsExpanded] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginUser, loginPass)) {
      setShowLoginModal(false);
      setLoginUser('');
      setLoginPass('');
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  const navItem = (icon: React.ReactNode, label: string, active: boolean, onClick: () => void, indent = false, highlight = false) => (
    <button
      onClick={() => { onClick(); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
        ${indent ? 'pl-9' : ''}
        ${active
          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
          : highlight
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
        }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'register-sale': return 'Registrar Venta';
      case 'monthly-sales': return `Ventas - ${MONTHS[selectedMonth]}`;
      case 'usd-transactions': return 'Transacciones USD';
      case 'annual-summary': return 'Resumen Anual';
      case 'global-search': return 'Búsqueda Global';
      case 'clients': return 'Agenda de Clientes';
      case 'change-log': return 'Log de Cambios';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">iPhone Sales</h1>
              <p className="text-xs text-slate-400">Control de Ventas 2026</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItem(<LayoutDashboard className="w-4 h-4 flex-shrink-0" />, 'Dashboard', currentPage === 'dashboard', () => onNavigate('dashboard'))}

          {/* Register Sale - Highlighted */}
          {navItem(
            <PlusCircle className="w-4 h-4 flex-shrink-0" />,
            '📱 Registrar Venta',
            currentPage === 'register-sale',
            () => onNavigate('register-sale'),
            false,
            currentPage !== 'register-sale'
          )}

          {/* Monthly Sales */}
          <div className="pt-4">
            <button
              onClick={() => setMonthsExpanded(!monthsExpanded)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {monthsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Ventas Mensuales
            </button>
          </div>
          {monthsExpanded && MONTHS.map((month, i) => (
            <React.Fragment key={i}>
              {navItem(
                <Calendar className="w-4 h-4 flex-shrink-0" />,
                month.charAt(0) + month.slice(1).toLowerCase(),
                currentPage === 'monthly-sales' && selectedMonth === i,
                () => onNavigate('monthly-sales', i),
                true
              )}
            </React.Fragment>
          ))}

          <div className="pt-4">
            <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Herramientas</p>
          </div>
          {navItem(<Users className="w-4 h-4 flex-shrink-0" />, 'Agenda Clientes', currentPage === 'clients', () => onNavigate('clients'))}
          {navItem(<DollarSign className="w-4 h-4 flex-shrink-0" />, 'Transacciones USD', currentPage === 'usd-transactions', () => onNavigate('usd-transactions'))}
          {navItem(<BarChart3 className="w-4 h-4 flex-shrink-0" />, 'Resumen Anual', currentPage === 'annual-summary', () => onNavigate('annual-summary'))}
          {navItem(<Search className="w-4 h-4 flex-shrink-0" />, 'Búsqueda Global', currentPage === 'global-search', () => onNavigate('global-search'))}
          {navItem(<FileText className="w-4 h-4 flex-shrink-0" />, 'Log de Cambios', currentPage === 'change-log', () => onNavigate('change-log'))}
        </nav>

        {/* Bottom actions */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Iniciar Sesión
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {sidebarOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
          </button>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary-500" />
            <span className="font-bold text-slate-800 dark:text-white text-sm">{getPageTitle()}</span>
          </div>
          <button
            onClick={() => isAuthenticated ? logout() : setShowLoginModal(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isAuthenticated ? <Unlock className="w-5 h-5 text-green-500" /> : <Lock className="w-5 h-5 text-slate-400" />}
          </button>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-3 items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-full">
                <Unlock className="w-3 h-3" /> Autenticado
              </span>
            )}
            {!isAuthenticated && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
              >
                <Lock className="w-3 h-3" /> Iniciar Sesión
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/25">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Iniciar Sesión</h3>
              <p className="text-sm text-slate-400 mt-1">Ingresa tus credenciales para editar</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Usuario</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={e => setLoginUser(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="admin"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              {loginError && <p className="text-sm text-red-500 text-center">{loginError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/25"
              >
                Ingresar
              </button>
              <p className="text-xs text-center text-slate-400">Demo: admin / admin123</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
