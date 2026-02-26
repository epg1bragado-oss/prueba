import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sale, USDTransaction, ChangeLog, Client, generateId, addDays } from './types';

interface StoreContextType {
  sales: Sale[];
  usdTransactions: USDTransaction[];
  changeLogs: ChangeLog[];
  clients: Client[];
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  addSale: (sale: Omit<Sale, 'id' | 'garantia' | 'gananciaARS'>) => boolean;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addUSDTransaction: (tx: Omit<USDTransaction, 'id' | 'ganancia'>) => void;
  updateUSDTransaction: (id: string, tx: Partial<USDTransaction>) => void;
  deleteUSDTransaction: (id: string) => void;
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isImeiUnique: (imei: string, excludeId?: string) => boolean;
  exportData: () => { sales: Sale[]; usdTransactions: USDTransaction[]; clients: Client[]; exchangeRate: number };
  importSales: (sales: Sale[]) => void;
  importUSDTransactions: (txs: USDTransaction[]) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

function generateSampleClients(): Client[] {
  return [
    { id: generateId(), nombre: 'Juan García', telefono: '+54 11 5555-1001', email: 'juan.garcia@email.com', direccion: 'Palermo, CABA', instagram: '@juangarcia', notas: 'Cliente frecuente', createdAt: '2026-01-01' },
    { id: generateId(), nombre: 'María López', telefono: '+54 11 5555-1002', email: 'maria.lopez@email.com', direccion: 'Belgrano, CABA', instagram: '@marialopez', notas: '', createdAt: '2026-01-02' },
    { id: generateId(), nombre: 'Carlos Rodríguez', telefono: '+54 11 5555-1003', email: 'carlos@email.com', direccion: 'Recoleta, CABA', instagram: '', notas: 'Prefiere efectivo', createdAt: '2026-01-05' },
    { id: generateId(), nombre: 'Ana Martínez', telefono: '+54 11 5555-1004', email: 'ana.m@email.com', direccion: 'San Isidro, GBA', instagram: '@anamartinez', notas: '', createdAt: '2026-01-10' },
    { id: generateId(), nombre: 'Pedro Sánchez', telefono: '+54 11 5555-1005', email: '', direccion: 'Caballito, CABA', instagram: '', notas: '', createdAt: '2026-01-15' },
    { id: generateId(), nombre: 'Lucía Fernández', telefono: '+54 11 5555-1006', email: 'lucia.f@email.com', direccion: 'Núñez, CABA', instagram: '@luciafernandez', notas: 'Interesada en Pro Max', createdAt: '2026-02-01' },
    { id: generateId(), nombre: 'Diego Torres', telefono: '+54 11 5555-1007', email: '', direccion: 'Flores, CABA', instagram: '@diegotorres', notas: '', createdAt: '2026-02-10' },
    { id: generateId(), nombre: 'Valentina Ruiz', telefono: '+54 11 5555-1008', email: 'vale.ruiz@email.com', direccion: 'Olivos, GBA', instagram: '', notas: '', createdAt: '2026-03-01' },
    { id: generateId(), nombre: 'Matías Gómez', telefono: '+54 11 5555-1009', email: '', direccion: 'Quilmes, GBA', instagram: '@matiasgomez', notas: 'Pagó con crypto', createdAt: '2026-03-15' },
    { id: generateId(), nombre: 'Sofía Díaz', telefono: '+54 11 5555-1010', email: 'sofia.diaz@email.com', direccion: 'Almagro, CABA', instagram: '@sofiadiaz', notas: '', createdAt: '2026-04-01' },
    { id: generateId(), nombre: 'Nicolás Castro', telefono: '+54 11 5555-1011', email: '', direccion: 'Villa Urquiza, CABA', instagram: '', notas: '', createdAt: '2026-04-10' },
    { id: generateId(), nombre: 'Camila Morales', telefono: '+54 11 5555-1012', email: 'camila@email.com', direccion: 'Pilar, GBA', instagram: '@camilamorales', notas: '', createdAt: '2026-05-01' },
    { id: generateId(), nombre: 'Facundo Álvarez', telefono: '+54 11 5555-1013', email: '', direccion: 'San Telmo, CABA', instagram: '', notas: '', createdAt: '2026-05-10' },
    { id: generateId(), nombre: 'Florencia Romero', telefono: '+54 11 5555-1014', email: 'flor.romero@email.com', direccion: 'Tigre, GBA', instagram: '@florromero', notas: 'Quiere iPhone 16 cuando llegue', createdAt: '2026-06-01' },
  ];
}

function generateSampleSales(): Sale[] {
  const providers = ['TechStore BA', 'iWorld Mendoza', 'AppleCenter CABA', 'MobileShop Córdoba', 'PhoneMax Rosario'];
  const clients = ['Juan García', 'María López', 'Carlos Rodríguez', 'Ana Martínez', 'Pedro Sánchez', 'Lucía Fernández', 'Diego Torres', 'Valentina Ruiz', 'Matías Gómez', 'Sofía Díaz', 'Nicolás Castro', 'Camila Morales', 'Facundo Álvarez', 'Florencia Romero'];
  const phones = ['+54 11 5555-1001', '+54 11 5555-1002', '+54 11 5555-1003', '+54 11 5555-1004', '+54 11 5555-1005', '+54 11 5555-1006', '+54 11 5555-1007', '+54 11 5555-1008', '+54 11 5555-1009', '+54 11 5555-1010', '+54 11 5555-1011', '+54 11 5555-1012', '+54 11 5555-1013', '+54 11 5555-1014'];
  const accessories = ['VIDRIO TEMPLADO, FUNDA SILICONA', 'FUNDA RIGIDA', 'VIDRIO TEMPLADO', 'CARGADOR, FUNDA SILICONA', 'VIDRIO TEMPLADO, FUNDA SILICONA, CARGADOR', 'CAJA ORIGINAL, CABLE USB-C'];
  const paymentMethods = ['EFECTIVO', 'TRANSFERENCIA', 'MERCADO PAGO', 'CRYPTO', 'MIXTO'];

  const sampleData: Partial<Sale>[] = [
    { month: 0, fechaVenta: '2026-01-05', iphone: '13 Pro Max', estado: 'USADO', capacidad: 256, bateria: 88, color: 'NEGRO', costoUSD: 580, ventaUSD: 720, notas: 'Pequeño rayón en esquina' },
    { month: 0, fechaVenta: '2026-01-12', iphone: '14 Pro', estado: 'NUEVO', capacidad: 128, bateria: 100, color: 'AZUL', costoUSD: 820, ventaUSD: 980, notas: '' },
    { month: 0, fechaVenta: '2026-01-20', iphone: '12', estado: 'USADO', capacidad: 64, bateria: 82, color: 'BLANCO', costoUSD: 320, ventaUSD: 430, notas: 'Cliente referido por María' },
    { month: 0, fechaVenta: '2026-01-28', iphone: '15 Pro', estado: 'NUEVO', capacidad: 256, bateria: 100, color: 'TITANIO NATURAL', costoUSD: 1050, ventaUSD: 1250, notas: '' },
    { month: 1, fechaVenta: '2026-02-03', iphone: '15 Pro Max', estado: 'NUEVO', capacidad: 512, bateria: 100, color: 'TITANIO NEGRO', costoUSD: 1250, ventaUSD: 1480, notas: '' },
    { month: 1, fechaVenta: '2026-02-10', iphone: '13', estado: 'USADO', capacidad: 128, bateria: 90, color: 'ROJO', costoUSD: 420, ventaUSD: 560, notas: '' },
    { month: 1, fechaVenta: '2026-02-18', iphone: '14 Pro Max', estado: 'USADO', capacidad: 256, bateria: 92, color: 'MORADO', costoUSD: 750, ventaUSD: 920, notas: 'Incluye AirPods como bonus' },
    { month: 2, fechaVenta: '2026-03-02', iphone: '14 Pro Max', estado: 'NUEVO', capacidad: 512, bateria: 100, color: 'DORADO', costoUSD: 1100, ventaUSD: 1350, notas: '' },
    { month: 2, fechaVenta: '2026-03-08', iphone: '12 Pro', estado: 'USADO', capacidad: 128, bateria: 85, color: 'PLATEADO', costoUSD: 380, ventaUSD: 500, notas: '' },
    { month: 2, fechaVenta: '2026-03-15', iphone: '15', estado: 'NUEVO', capacidad: 128, bateria: 100, color: 'AZUL', costoUSD: 720, ventaUSD: 880, notas: '' },
    { month: 2, fechaVenta: '2026-03-22', iphone: '11', estado: 'USADO', capacidad: 64, bateria: 78, color: 'NEGRO', costoUSD: 230, ventaUSD: 340, notas: 'Batería por debajo del 80%' },
    { month: 3, fechaVenta: '2026-04-01', iphone: '16 Pro', estado: 'NUEVO', capacidad: 256, bateria: 100, color: 'TITANIO NATURAL', costoUSD: 1150, ventaUSD: 1380, notas: '' },
    { month: 3, fechaVenta: '2026-04-10', iphone: '14', estado: 'USADO', capacidad: 128, bateria: 91, color: 'BLANCO', costoUSD: 520, ventaUSD: 670, notas: '' },
    { month: 3, fechaVenta: '2026-04-18', iphone: '13 Pro', estado: 'USADO', capacidad: 256, bateria: 87, color: 'VERDE', costoUSD: 550, ventaUSD: 700, notas: '' },
    { month: 4, fechaVenta: '2026-05-05', iphone: '16 Pro Max', estado: 'NUEVO', capacidad: 512, bateria: 100, color: 'TITANIO BLANCO', costoUSD: 1350, ventaUSD: 1600, notas: 'Entrega especial a domicilio' },
    { month: 4, fechaVenta: '2026-05-12', iphone: '15 Plus', estado: 'NUEVO', capacidad: 256, bateria: 100, color: 'ROSA', costoUSD: 850, ventaUSD: 1020, notas: '' },
    { month: 4, fechaVenta: '2026-05-20', iphone: '12 Mini', estado: 'USADO', capacidad: 64, bateria: 80, color: 'ROJO', costoUSD: 280, ventaUSD: 380, notas: '' },
    { month: 5, fechaVenta: '2026-06-03', iphone: '15 Pro', estado: 'USADO', capacidad: 256, bateria: 94, color: 'TITANIO AZUL', costoUSD: 900, ventaUSD: 1100, notas: '' },
    { month: 5, fechaVenta: '2026-06-15', iphone: '14 Plus', estado: 'NUEVO', capacidad: 128, bateria: 100, color: 'AMARILLO', costoUSD: 700, ventaUSD: 850, notas: '' },
  ];

  const rate = 1200;
  return sampleData.map((s, i) => {
    const costoARS = (s.costoUSD || 0) * rate;
    const ventaARS = (s.ventaUSD || 0) * rate;
    return {
      id: generateId() + i,
      month: s.month!,
      fechaVenta: s.fechaVenta!,
      garantia: addDays(s.fechaVenta!, 45),
      proveedor: providers[i % providers.length],
      cliente: clients[i % clients.length],
      clienteTelefono: phones[i % phones.length],
      clienteEmail: i % 2 === 0 ? `${clients[i % clients.length].split(' ')[0].toLowerCase()}@email.com` : '',
      iphone: s.iphone!,
      estado: s.estado!,
      capacidad: s.capacidad!,
      bateria: s.bateria!,
      color: s.color!,
      costoUSD: s.costoUSD!,
      costoARS,
      ventaUSD: s.ventaUSD!,
      ventaARS,
      gananciaARS: ventaARS - costoARS,
      pagado: Math.random() > 0.2,
      metodoPago: paymentMethods[i % paymentMethods.length],
      accesorios: accessories[i % accessories.length],
      entregado: Math.random() > 0.15,
      fechaEntrega: Math.random() > 0.15 ? s.fechaVenta! : '',
      imei: String(350000000000000 + Math.floor(Math.random() * 99999999999)),
      notas: s.notas || '',
    };
  });
}

function generateSampleUSDTransactions(): USDTransaction[] {
  const data = [
    { fecha: '2026-01-10', cliente: 'Exchange House A', clienteVenta: 'Juan García', cantidad: 500, precioCosto: 1180, precioVenta: 1210, operacion: 'TRANSFERENCIA' },
    { fecha: '2026-02-05', cliente: 'Crypto Exchange', clienteVenta: 'María López', cantidad: 1000, precioCosto: 1190, precioVenta: 1225, operacion: 'CRYPTO' },
    { fecha: '2026-03-12', cliente: 'Exchange House B', clienteVenta: 'Carlos Rodríguez', cantidad: 750, precioCosto: 1200, precioVenta: 1240, operacion: 'EFECTIVO' },
    { fecha: '2026-04-08', cliente: 'Exchange House A', clienteVenta: 'Ana Martínez', cantidad: 300, precioCosto: 1210, precioVenta: 1250, operacion: 'MERCADO PAGO' },
  ];
  return data.map((d, i) => ({
    id: generateId() + 'usd' + i,
    ...d,
    costoPesos: d.cantidad * d.precioCosto,
    ventaPesos: d.cantidad * d.precioVenta,
    ganancia: d.cantidad * (d.precioVenta - d.precioCosto),
  }));
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem('iphone-sales-v2');
      return saved ? JSON.parse(saved) : generateSampleSales();
    } catch { return generateSampleSales(); }
  });

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('iphone-clients');
      return saved ? JSON.parse(saved) : generateSampleClients();
    } catch { return generateSampleClients(); }
  });

  const [usdTransactions, setUsdTransactions] = useState<USDTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('iphone-usd-tx');
      return saved ? JSON.parse(saved) : generateSampleUSDTransactions();
    } catch { return generateSampleUSDTransactions(); }
  });

  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>(() => {
    try {
      const saved = localStorage.getItem('iphone-logs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('iphone-rate');
      return saved ? parseFloat(saved) : 1200;
    } catch { return 1200; }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('iphone-dark') === 'true';
    } catch { return false; }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { localStorage.setItem('iphone-sales-v2', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('iphone-clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('iphone-usd-tx', JSON.stringify(usdTransactions)); }, [usdTransactions]);
  useEffect(() => { localStorage.setItem('iphone-logs', JSON.stringify(changeLogs)); }, [changeLogs]);
  useEffect(() => { localStorage.setItem('iphone-rate', String(exchangeRate)); }, [exchangeRate]);
  useEffect(() => {
    localStorage.setItem('iphone-dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addLog = useCallback((action: ChangeLog['action'], entity: ChangeLog['entity'], entityId: string, details: string) => {
    setChangeLogs(prev => [{
      id: generateId(),
      timestamp: new Date().toISOString(),
      action, entity, entityId, details,
      user: 'admin',
    }, ...prev].slice(0, 500));
  }, []);

  const isImeiUnique = useCallback((imei: string, excludeId?: string): boolean => {
    return !sales.some(s => s.imei === imei && s.id !== excludeId);
  }, [sales]);

  const addSale = useCallback((saleData: Omit<Sale, 'id' | 'garantia' | 'gananciaARS'>): boolean => {
    if (!isImeiUnique(saleData.imei)) return false;
    const sale: Sale = {
      ...saleData,
      id: generateId(),
      garantia: addDays(saleData.fechaVenta, 45),
      gananciaARS: saleData.ventaARS - saleData.costoARS,
    };
    setSales(prev => [...prev, sale]);
    addLog('CREAR', 'VENTA', sale.id, `iPhone ${sale.iphone} ${sale.capacidad}GB ${sale.color} → ${sale.cliente} | ${sale.imei}`);
    return true;
  }, [isImeiUnique, addLog]);

  const updateSale = useCallback((id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, ...updates };
      if (updates.fechaVenta) updated.garantia = addDays(updated.fechaVenta, 45);
      updated.gananciaARS = updated.ventaARS - updated.costoARS;
      return updated;
    }));
    addLog('EDITAR', 'VENTA', id, `Actualizado: ${Object.keys(updates).join(', ')}`);
  }, [addLog]);

  const deleteSale = useCallback((id: string) => {
    const sale = sales.find(s => s.id === id);
    setSales(prev => prev.filter(s => s.id !== id));
    addLog('ELIMINAR', 'VENTA', id, `Eliminado: iPhone ${sale?.iphone} - ${sale?.cliente}`);
  }, [sales, addLog]);

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const client: Client = {
      ...clientData,
      id: generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients(prev => [...prev, client]);
    addLog('CREAR', 'CLIENTE', client.id, `Nuevo cliente: ${client.nombre}`);
    return client;
  }, [addLog]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    addLog('EDITAR', 'CLIENTE', id, `Cliente actualizado: ${Object.keys(updates).join(', ')}`);
  }, [addLog]);

  const deleteClient = useCallback((id: string) => {
    const client = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    addLog('ELIMINAR', 'CLIENTE', id, `Eliminado: ${client?.nombre}`);
  }, [clients, addLog]);

  const addUSDTransaction = useCallback((txData: Omit<USDTransaction, 'id' | 'ganancia'>) => {
    const tx: USDTransaction = {
      ...txData,
      id: generateId(),
      ganancia: txData.ventaPesos - txData.costoPesos,
    };
    setUsdTransactions(prev => [...prev, tx]);
    addLog('CREAR', 'TRANSACCION_USD', tx.id, `USD ${tx.cantidad} - ${tx.cliente}`);
  }, [addLog]);

  const updateUSDTransaction = useCallback((id: string, updates: Partial<USDTransaction>) => {
    setUsdTransactions(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, ...updates };
      updated.costoPesos = updated.cantidad * updated.precioCosto;
      updated.ventaPesos = updated.cantidad * updated.precioVenta;
      updated.ganancia = updated.ventaPesos - updated.costoPesos;
      return updated;
    }));
    addLog('EDITAR', 'TRANSACCION_USD', id, `Actualizado: ${Object.keys(updates).join(', ')}`);
  }, [addLog]);

  const deleteUSDTransaction = useCallback((id: string) => {
    setUsdTransactions(prev => prev.filter(t => t.id !== id));
    addLog('ELIMINAR', 'TRANSACCION_USD', id, 'Transacción eliminada');
  }, [addLog]);

  const login = useCallback((user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setIsAuthenticated(false), []);
  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  const setExchangeRate = useCallback((rate: number) => setExchangeRateState(rate), []);

  const exportData = useCallback(() => ({
    sales, usdTransactions, clients, exchangeRate,
  }), [sales, usdTransactions, clients, exchangeRate]);

  const importSales = useCallback((newSales: Sale[]) => {
    setSales(newSales);
    addLog('CREAR', 'VENTA', 'IMPORT', `Importados ${newSales.length} registros`);
  }, [addLog]);

  const importUSDTransactions = useCallback((txs: USDTransaction[]) => {
    setUsdTransactions(txs);
    addLog('CREAR', 'TRANSACCION_USD', 'IMPORT', `Importados ${txs.length} registros`);
  }, [addLog]);

  return (
    <StoreContext.Provider value={{
      sales, usdTransactions, changeLogs, clients, exchangeRate, setExchangeRate,
      addSale, updateSale, deleteSale,
      addClient, updateClient, deleteClient,
      addUSDTransaction, updateUSDTransaction, deleteUSDTransaction,
      isAuthenticated, login, logout, darkMode, toggleDarkMode,
      isImeiUnique, exportData, importSales, importUSDTransactions,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
