import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import {
  Sale, MONTHS, IPHONE_MODELS, CAPACITIES, COLORS_IPHONE,
  ACCESSORIES_OPTIONS, PAYMENT_METHODS, formatARS, formatUSD, formatDate,
  addDays, Page,
} from '../types';
import {
  User, Smartphone, DollarSign, Package, CheckCircle2, ArrowRight, ArrowLeft,
  Search, Plus, Phone, Mail, X, ShieldCheck, AlertCircle,
  Zap, Tag, CreditCard, FileText, ChevronRight,
} from 'lucide-react';

interface Props {
  onNavigate: (page: Page, month?: number) => void;
  editSale?: Sale | null;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, label: 'Cliente', icon: User, description: 'Datos del comprador' },
  { id: 2, label: 'Equipo', icon: Smartphone, description: 'Detalles del iPhone' },
  { id: 3, label: 'Precios', icon: DollarSign, description: 'Costos y valores' },
  { id: 4, label: 'Extras', icon: Package, description: 'Accesorios y entrega' },
  { id: 5, label: 'Confirmar', icon: CheckCircle2, description: 'Resumen final' },
];

interface FormData {
  month: number;
  fechaVenta: string;
  proveedor: string;
  cliente: string;
  clienteTelefono: string;
  clienteEmail: string;
  iphone: string;
  estado: 'USADO' | 'NUEVO';
  capacidad: number;
  bateria: number;
  color: string;
  costoUSD: number;
  costoARS: number;
  ventaUSD: number;
  ventaARS: number;
  pagado: boolean;
  metodoPago: string;
  accesorios: string;
  entregado: boolean;
  fechaEntrega: string;
  imei: string;
  notas: string;
}

const RegisterSale: React.FC<Props> = ({ onNavigate, editSale, onClose }) => {
  const { addSale, updateSale, exchangeRate, setExchangeRate, isAuthenticated, isImeiUnique, clients, addClient } = useStore();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [customAccessory, setCustomAccessory] = useState('');
  const [newClientData, setNewClientData] = useState({ nombre: '', telefono: '', email: '', direccion: '', instagram: '', notas: '' });
  const [localRate, setLocalRate] = useState(exchangeRate);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();

  const [form, setForm] = useState<FormData>(() => {
    if (editSale) {
      const accs = editSale.accesorios ? editSale.accesorios.split(', ').filter(Boolean) : [];
      setTimeout(() => setSelectedAccessories(accs), 0);
      return {
        month: editSale.month,
        fechaVenta: editSale.fechaVenta,
        proveedor: editSale.proveedor,
        cliente: editSale.cliente,
        clienteTelefono: editSale.clienteTelefono,
        clienteEmail: editSale.clienteEmail,
        iphone: editSale.iphone,
        estado: editSale.estado,
        capacidad: editSale.capacidad,
        bateria: editSale.bateria,
        color: editSale.color,
        costoUSD: editSale.costoUSD,
        costoARS: editSale.costoARS,
        ventaUSD: editSale.ventaUSD,
        ventaARS: editSale.ventaARS,
        pagado: editSale.pagado,
        metodoPago: editSale.metodoPago,
        accesorios: editSale.accesorios,
        entregado: editSale.entregado,
        fechaEntrega: editSale.fechaEntrega,
        imei: editSale.imei,
        notas: editSale.notas,
      };
    }
    return {
      month: currentMonth,
      fechaVenta: today,
      proveedor: '',
      cliente: '',
      clienteTelefono: '',
      clienteEmail: '',
      iphone: '15 Pro Max',
      estado: 'NUEVO',
      capacidad: 256,
      bateria: 100,
      color: 'TITANIO NATURAL',
      costoUSD: 0,
      costoARS: 0,
      ventaUSD: 0,
      ventaARS: 0,
      pagado: false,
      metodoPago: 'EFECTIVO',
      accesorios: '',
      entregado: false,
      fechaEntrega: '',
      imei: '',
      notas: '',
    };
  });

  const updateForm = (field: string, value: string | number | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'costoUSD') updated.costoARS = Number(value) * localRate;
      if (field === 'ventaUSD') updated.ventaARS = Number(value) * localRate;
      if (field === 'fechaVenta') {
        const d = new Date(String(value) + 'T12:00:00');
        updated.month = d.getMonth();
      }
      if (field === 'estado' && value === 'NUEVO') updated.bateria = 100;
      return updated;
    });
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const ganancia = form.ventaARS - form.costoARS;
  const margen = form.ventaARS > 0 ? (ganancia / form.ventaARS * 100) : 0;
  const garantiaDate = form.fechaVenta ? addDays(form.fechaVenta, 45) : '';

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients.slice(0, 8);
    const term = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.telefono.includes(term) ||
      c.email.toLowerCase().includes(term)
    ).slice(0, 8);
  }, [clients, clientSearch]);

  const selectClient = (client: { nombre: string; telefono: string; email: string }) => {
    updateForm('cliente', client.nombre);
    updateForm('clienteTelefono', client.telefono);
    updateForm('clienteEmail', client.email);
    setClientSearch('');
  };

  const handleCreateClient = () => {
    if (!newClientData.nombre.trim()) return;
    const client = addClient(newClientData);
    selectClient(client);
    setShowNewClient(false);
    setNewClientData({ nombre: '', telefono: '', email: '', direccion: '', instagram: '', notas: '' });
  };

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories(prev => {
      const next = prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc];
      setForm(f => ({ ...f, accesorios: next.join(', ') }));
      return next;
    });
  };

  const addCustomAccessory = () => {
    if (customAccessory.trim()) {
      const acc = customAccessory.trim().toUpperCase();
      if (!selectedAccessories.includes(acc)) {
        toggleAccessory(acc);
      }
      setCustomAccessory('');
    }
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!form.cliente.trim()) newErrors.cliente = 'El nombre del cliente es obligatorio';
    }
    if (s === 2) {
      if (!form.imei.trim()) newErrors.imei = 'El IMEI es obligatorio';
      else if (form.imei.length < 10) newErrors.imei = 'El IMEI debe tener al menos 10 dígitos';
      else if (!isImeiUnique(form.imei, editSale?.id)) newErrors.imei = 'Este IMEI ya está registrado en otra venta';
      if (!form.fechaVenta) newErrors.fechaVenta = 'La fecha de venta es obligatoria';
    }
    if (s === 3) {
      if (form.costoUSD <= 0 && form.costoARS <= 0) newErrors.costoUSD = 'Ingresa un costo válido';
      if (form.ventaUSD <= 0 && form.ventaARS <= 0) newErrors.ventaUSD = 'Ingresa un precio de venta válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(Math.min(step + 1, 5));
    }
  };

  const prevStep = () => setStep(Math.max(step - 1, 1));

  const handleSubmit = () => {
    if (!isAuthenticated) return;
    const saleData = {
      ...form,
      accesorios: selectedAccessories.join(', '),
    };

    if (editSale) {
      updateSale(editSale.id, saleData);
      if (onClose) onClose();
    } else {
      const result = addSale(saleData);
      if (result) {
        setSuccess(true);
      } else {
        setErrors({ submit: 'Error al registrar la venta. Verifica que el IMEI sea único.' });
      }
    }
  };

  const handleNewSale = () => {
    setSuccess(false);
    setStep(1);
    setSelectedAccessories([]);
    setForm({
      month: currentMonth,
      fechaVenta: today,
      proveedor: '',
      cliente: '',
      clienteTelefono: '',
      clienteEmail: '',
      iphone: '15 Pro Max',
      estado: 'NUEVO',
      capacidad: 256,
      bateria: 100,
      color: 'TITANIO NATURAL',
      costoUSD: 0,
      costoARS: 0,
      ventaUSD: 0,
      ventaARS: 0,
      pagado: false,
      metodoPago: 'EFECTIVO',
      accesorios: '',
      entregado: false,
      fechaEntrega: '',
      imei: '',
      notas: '',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Acceso Restringido</h3>
          <p className="text-slate-400 mb-4">Debes iniciar sesión para registrar ventas</p>
          <p className="text-xs text-slate-400">Credenciales demo: admin / admin123</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-lg w-full">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">¡Venta Registrada!</h3>
          <p className="text-slate-400 mb-2">La venta se ha registrado exitosamente</p>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">Equipo:</span> iPhone {form.iphone} {form.capacidad}GB {form.color}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">Cliente:</span> {form.cliente}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">Precio:</span> {formatUSD(form.ventaUSD)} / {formatARS(form.ventaARS)}</p>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400"><span className="font-semibold">Ganancia:</span> {formatARS(ganancia)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleNewSale} className="px-6 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/25">
              <Plus className="w-4 h-4 inline mr-2" />Registrar Otra Venta
            </button>
            <button onClick={() => onNavigate('monthly-sales', form.month)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Ver en {MONTHS[form.month]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-slate-400";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
  const errorClass = "text-xs text-red-500 mt-1 flex items-center gap-1";

  const isModal = !!editSale;
  const containerClass = isModal
    ? ""
    : "max-w-4xl mx-auto space-y-6 animate-fade-in";

  return (
    <div className={containerClass}>
      {/* Header */}
      {!isModal && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {editSale ? 'Editar Venta' : '📱 Registrar Nueva Venta'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">Completa los datos paso a paso para agendar la venta</p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => { if (isComplete || isActive) setStep(s.id); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25' :
                    isComplete ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-500/20' :
                    'bg-slate-50 dark:bg-slate-700/50 text-slate-400 cursor-default'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className={`text-[10px] ${isActive ? 'text-white/80' : ''}`}>{s.description}</p>
                  </div>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 mx-1 ${isComplete ? 'text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
          <div className="bg-primary-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">

        {/* STEP 1: Cliente */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Datos del Cliente</h3>
                <p className="text-sm text-slate-400">Selecciona un cliente existente o crea uno nuevo</p>
              </div>
            </div>

            {/* Client Search */}
            <div>
              <label className={labelClass}>Buscar Cliente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder="Buscar por nombre, teléfono o email..."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Client List */}
            {(clientSearch || !form.cliente) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-md ${
                      form.cliente === client.nombre
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                        : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {client.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{client.nombre}</p>
                      <p className="text-xs text-slate-400 truncate">{client.telefono}</p>
                    </div>
                    {form.cliente === client.nombre && (
                      <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
              <span className="text-xs text-slate-400 font-medium">O</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            </div>

            {/* New Client Button */}
            <button onClick={() => setShowNewClient(!showNewClient)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-all">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Crear Cliente Nuevo</span>
            </button>

            {/* New Client Form */}
            {showNewClient && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3 animate-fade-in border border-slate-200 dark:border-slate-600">
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Nuevo Cliente</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nombre *</label>
                    <input type="text" value={newClientData.nombre} onChange={e => setNewClientData(p => ({ ...p, nombre: e.target.value }))} className={inputClass} placeholder="Nombre completo" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Teléfono</label>
                    <input type="tel" value={newClientData.telefono} onChange={e => setNewClientData(p => ({ ...p, telefono: e.target.value }))} className={inputClass} placeholder="+54 11 5555-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                    <input type="email" value={newClientData.email} onChange={e => setNewClientData(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="email@ejemplo.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Instagram</label>
                    <input type="text" value={newClientData.instagram} onChange={e => setNewClientData(p => ({ ...p, instagram: e.target.value }))} className={inputClass} placeholder="@usuario" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Dirección</label>
                    <input type="text" value={newClientData.direccion} onChange={e => setNewClientData(p => ({ ...p, direccion: e.target.value }))} className={inputClass} placeholder="Barrio, Ciudad" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowNewClient(false)} className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancelar</button>
                  <button onClick={handleCreateClient} className="px-4 py-2 rounded-lg text-sm bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors">Crear y Seleccionar</button>
                </div>
              </div>
            )}

            {/* Selected Client Display */}
            {form.cliente && (
              <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-primary-700 dark:text-primary-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Cliente Seleccionado
                  </h4>
                  <button onClick={() => { updateForm('cliente', ''); updateForm('clienteTelefono', ''); updateForm('clienteEmail', ''); }} className="text-xs text-primary-500 hover:text-primary-700 font-medium">Cambiar</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-slate-800 dark:text-white">{form.cliente}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary-400" />
                      <input type="tel" value={form.clienteTelefono} onChange={e => updateForm('clienteTelefono', e.target.value)} className="bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none border-b border-transparent focus:border-primary-400 w-full" placeholder="Agregar teléfono" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary-400" />
                      <input type="email" value={form.clienteEmail} onChange={e => updateForm('clienteEmail', e.target.value)} className="bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none border-b border-transparent focus:border-primary-400 w-full" placeholder="Agregar email" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errors.cliente && <p className={errorClass}><AlertCircle className="w-3 h-3" />{errors.cliente}</p>}
          </div>
        )}

        {/* STEP 2: Equipo */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Datos del Equipo</h3>
                <p className="text-sm text-slate-400">Especificaciones del iPhone a vender</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label className={labelClass}>📅 Fecha de Venta *</label>
                <input type="date" value={form.fechaVenta} onChange={e => updateForm('fechaVenta', e.target.value)} className={inputClass} />
                {errors.fechaVenta && <p className={errorClass}><AlertCircle className="w-3 h-3" />{errors.fechaVenta}</p>}
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Garantía hasta: {garantiaDate ? formatDate(garantiaDate) : '—'}</p>
                <p className="text-xs text-primary-500 mt-0.5">Mes: {MONTHS[form.month]}</p>
              </div>

              {/* Model */}
              <div>
                <label className={labelClass}>📱 Modelo iPhone *</label>
                <select value={form.iphone} onChange={e => updateForm('iphone', e.target.value)} className={inputClass}>
                  {IPHONE_MODELS.map(m => <option key={m} value={m}>iPhone {m}</option>)}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className={labelClass}>📋 Estado</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => updateForm('estado', 'NUEVO')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.estado === 'NUEVO'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                    }`}>
                    <Zap className="w-4 h-4" /> NUEVO
                  </button>
                  <button type="button" onClick={() => updateForm('estado', 'USADO')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.estado === 'USADO'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                    }`}>
                    <Tag className="w-4 h-4" /> USADO
                  </button>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className={labelClass}>💾 Capacidad</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CAPACITIES.map(c => (
                    <button key={c} type="button" onClick={() => updateForm('capacidad', c)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        form.capacidad === c
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}>
                      {c >= 1024 ? '1TB' : `${c}GB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className={labelClass}>🎨 Color</label>
                <select value={form.color} onChange={e => updateForm('color', e.target.value)} className={inputClass}>
                  {COLORS_IPHONE.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Battery */}
              <div>
                <label className={labelClass}>🔋 Batería ({form.bateria}%)</label>
                <input
                  type="range" min="0" max="100" value={form.bateria}
                  onChange={e => updateForm('bateria', Number(e.target.value))}
                  disabled={form.estado === 'NUEVO'}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span>
                  <span className={`font-semibold ${form.bateria >= 80 ? 'text-emerald-500' : form.bateria >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{form.bateria}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* IMEI */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className={labelClass}>🔐 IMEI *</label>
                <input type="text" value={form.imei} onChange={e => updateForm('imei', e.target.value.replace(/\D/g, ''))} className={inputClass} placeholder="Número IMEI de 15 dígitos (marca *#06#)" maxLength={15} />
                {errors.imei && <p className={errorClass}><AlertCircle className="w-3 h-3" />{errors.imei}</p>}
                {form.imei && !errors.imei && <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> IMEI válido y disponible</p>}
              </div>

              {/* Provider */}
              <div>
                <label className={labelClass}>🏪 Proveedor</label>
                <input type="text" value={form.proveedor} onChange={e => updateForm('proveedor', e.target.value)} className={inputClass} placeholder="Nombre del proveedor" />
              </div>
            </div>

            {/* Equipment Preview */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 rounded-xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-slate-500 dark:text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">iPhone {form.iphone}</p>
                <p className="text-sm text-slate-500">{form.capacidad >= 1024 ? '1TB' : `${form.capacidad}GB`} · {form.color} · {form.estado} · Bat: {form.bateria}%</p>
                {form.imei && <p className="text-xs text-slate-400 font-mono">IMEI: {form.imei}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Precios */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Precios y Costos</h3>
                <p className="text-sm text-slate-400">Define los valores de compra y venta</p>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Tipo de Cambio</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={localRate} onChange={e => { setLocalRate(Number(e.target.value)); setExchangeRate(Number(e.target.value)); }} className="w-24 px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-500/50 bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <span className="text-sm text-blue-500 font-medium">ARS/USD</span>
                </div>
              </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cost Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-red-500" /> Costo de Compra
                </h4>
                <div>
                  <label className={labelClass}>Costo en USD</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={form.costoUSD || ''} onChange={e => updateForm('costoUSD', Number(e.target.value))} className={`${inputClass} pl-7`} placeholder="0.00" />
                  </div>
                  {errors.costoUSD && <p className={errorClass}><AlertCircle className="w-3 h-3" />{errors.costoUSD}</p>}
                </div>
                <div>
                  <label className={labelClass}>Costo en ARS</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                    <input type="number" min="0" step="1" value={form.costoARS || ''} onChange={e => updateForm('costoARS', Number(e.target.value))} className={`${inputClass} pl-7`} placeholder="Auto-calculado" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Auto: {form.costoUSD > 0 ? formatARS(form.costoUSD * localRate) : '—'}</p>
                </div>
              </div>

              {/* Sale Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Precio de Venta
                </h4>
                <div>
                  <label className={labelClass}>Venta en USD</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={form.ventaUSD || ''} onChange={e => updateForm('ventaUSD', Number(e.target.value))} className={`${inputClass} pl-7`} placeholder="0.00" />
                  </div>
                  {errors.ventaUSD && <p className={errorClass}><AlertCircle className="w-3 h-3" />{errors.ventaUSD}</p>}
                </div>
                <div>
                  <label className={labelClass}>Venta en ARS</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">$</span>
                    <input type="number" min="0" step="1" value={form.ventaARS || ''} onChange={e => updateForm('ventaARS', Number(e.target.value))} className={`${inputClass} pl-7`} placeholder="Auto-calculado" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Auto: {form.ventaUSD > 0 ? formatARS(form.ventaUSD * localRate) : '—'}</p>
                </div>
              </div>
            </div>

            {/* Profit Display */}
            <div className={`rounded-xl p-5 border-2 ${ganancia > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30' : ganancia < 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ganancia Estimada</p>
                  <p className={`text-3xl font-bold ${ganancia > 0 ? 'text-emerald-600 dark:text-emerald-400' : ganancia < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {formatARS(ganancia)}
                  </p>
                  <p className="text-sm text-slate-400 mt-0.5">{formatUSD(form.ventaUSD - form.costoUSD)} USD</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Margen</p>
                  <p className={`text-2xl font-bold ${margen > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {margen.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Extras */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Accesorios, Pago y Entrega</h3>
                <p className="text-sm text-slate-400">Detalles adicionales de la venta</p>
              </div>
            </div>

            {/* Accessories */}
            <div>
              <label className={labelClass}>🎁 Accesorios Incluidos</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {ACCESSORIES_OPTIONS.map(acc => (
                  <button key={acc} type="button" onClick={() => toggleAccessory(acc)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedAccessories.includes(acc)
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}>
                    {selectedAccessories.includes(acc) ? '✓ ' : ''}{acc}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={customAccessory} onChange={e => setCustomAccessory(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAccessory())} className={inputClass} placeholder="Agregar otro accesorio..." />
                <button type="button" onClick={addCustomAccessory} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {selectedAccessories.length > 0 && (
                <p className="text-xs text-primary-500 mt-2">Seleccionados: {selectedAccessories.join(', ')}</p>
              )}
            </div>

            {/* Payment */}
            <div>
              <label className={labelClass}><CreditCard className="w-4 h-4 inline mr-1" />Método de Pago</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map(method => (
                  <button key={method} type="button" onClick={() => updateForm('metodoPago', method)}
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all border-2 ${
                      form.metodoPago === method
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                    }`}>
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment & Delivery Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-7 rounded-full p-0.5 transition-colors ${form.pagado ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${form.pagado ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" checked={form.pagado} onChange={e => updateForm('pagado', e.target.checked)} className="sr-only" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm block">💰 Pagado</span>
                    <span className="text-xs text-slate-400">{form.pagado ? 'El cliente ya pagó' : 'Pendiente de cobro'}</span>
                  </div>
                </label>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-7 rounded-full p-0.5 transition-colors ${form.entregado ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${form.entregado ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" checked={form.entregado} onChange={e => { updateForm('entregado', e.target.checked); if (e.target.checked && !form.fechaEntrega) updateForm('fechaEntrega', today); }} className="sr-only" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm block">📦 Entregado</span>
                    <span className="text-xs text-slate-400">{form.entregado ? 'Equipo entregado' : 'Pendiente de entrega'}</span>
                  </div>
                </label>
              </div>
            </div>

            {form.entregado && (
              <div>
                <label className={labelClass}>📅 Fecha de Entrega</label>
                <input type="date" value={form.fechaEntrega} onChange={e => updateForm('fechaEntrega', e.target.value)} className={inputClass} />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className={labelClass}><FileText className="w-4 h-4 inline mr-1" />Notas Adicionales</label>
              <textarea value={form.notas} onChange={e => updateForm('notas', e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="Observaciones, condiciones especiales, referencias..." />
            </div>
          </div>
        )}

        {/* STEP 5: Summary */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Confirmar Venta</h3>
                <p className="text-sm text-slate-400">Revisa todos los datos antes de confirmar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Client Info */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><User className="w-4 h-4 text-primary-500" /> Cliente</h4>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{form.cliente}</p>
                  {form.clienteTelefono && <p className="text-sm text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {form.clienteTelefono}</p>}
                  {form.clienteEmail && <p className="text-sm text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {form.clienteEmail}</p>}
                </div>
              </div>

              {/* Equipment Info */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><Smartphone className="w-4 h-4 text-violet-500" /> Equipo</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">iPhone {form.iphone} · {form.capacidad >= 1024 ? '1TB' : `${form.capacidad}GB`}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${form.estado === 'NUEVO' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>{form.estado}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs">{form.color}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs">🔋 {form.bateria}%</span>
                </div>
                <p className="text-xs text-slate-400 font-mono">IMEI: {form.imei}</p>
                {form.proveedor && <p className="text-xs text-slate-400">Proveedor: {form.proveedor}</p>}
              </div>

              {/* Dates */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">📅 Fechas</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">Venta: <span className="font-medium">{formatDate(form.fechaVenta)}</span></p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Garantía: <span className="font-medium">{formatDate(garantiaDate)}</span></p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Mes: <span className="font-medium text-primary-500">{MONTHS[form.month]}</span></p>
                {form.fechaEntrega && <p className="text-sm text-slate-600 dark:text-slate-300">Entrega: <span className="font-medium">{formatDate(form.fechaEntrega)}</span></p>}
              </div>

              {/* Status */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">📋 Estado</h4>
                <div className="flex gap-4">
                  <span className={`flex items-center gap-1 text-sm font-medium ${form.pagado ? 'text-emerald-600' : 'text-red-500'}`}>
                    {form.pagado ? '✅' : '❌'} {form.pagado ? 'Pagado' : 'No pagado'}
                  </span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${form.entregado ? 'text-emerald-600' : 'text-red-500'}`}>
                    {form.entregado ? '✅' : '❌'} {form.entregado ? 'Entregado' : 'No entregado'}
                  </span>
                </div>
                <p className="text-sm text-slate-500">Pago: <span className="font-medium">{form.metodoPago}</span></p>
                {selectedAccessories.length > 0 && <p className="text-sm text-slate-500">Accesorios: <span className="font-medium">{selectedAccessories.join(', ')}</span></p>}
                {form.notas && <p className="text-sm text-slate-400 italic mt-1">"{form.notas}"</p>}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6 text-white">
              <h4 className="text-sm font-medium text-slate-300 mb-4 uppercase tracking-wide">Resumen Financiero</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Costo</p>
                  <p className="text-lg font-bold">{formatUSD(form.costoUSD)}</p>
                  <p className="text-xs text-slate-400">{formatARS(form.costoARS)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Venta</p>
                  <p className="text-lg font-bold">{formatUSD(form.ventaUSD)}</p>
                  <p className="text-xs text-slate-400">{formatARS(form.ventaARS)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Ganancia</p>
                  <p className={`text-lg font-bold ${ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatARS(ganancia)}</p>
                  <p className="text-xs text-slate-400">{formatUSD(form.ventaUSD - form.costoUSD)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Margen</p>
                  <p className={`text-lg font-bold ${margen >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{margen.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400">TC: {localRate}</p>
                </div>
              </div>
            </div>

            {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-center justify-between">
        <button
          onClick={step === 1 ? (onClose || (() => onNavigate('dashboard'))) : prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
        >
          {step === 1 ? <X className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {step === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        <span className="text-sm text-slate-400 hidden sm:block">Paso {step} de 5</span>

        {step < 5 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 text-sm font-semibold transition-colors shadow-md shadow-primary-500/25"
          >
            Siguiente <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 text-sm font-bold transition-all shadow-lg shadow-emerald-500/25"
          >
            <CheckCircle2 className="w-4 h-4" />
            {editSale ? 'Guardar Cambios' : 'Confirmar Venta'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterSale;
