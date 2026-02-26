export interface Client {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  instagram: string;
  notas: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  month: number;
  fechaVenta: string;
  garantia: string;
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
  gananciaARS: number;
  pagado: boolean;
  metodoPago: string;
  accesorios: string;
  entregado: boolean;
  fechaEntrega: string;
  imei: string;
  notas: string;
}

export interface USDTransaction {
  id: string;
  fecha: string;
  cliente: string;
  clienteVenta: string;
  cantidad: number;
  precioCosto: number;
  precioVenta: number;
  costoPesos: number;
  ventaPesos: number;
  ganancia: number;
  operacion: string;
}

export interface ChangeLog {
  id: string;
  timestamp: string;
  action: 'CREAR' | 'EDITAR' | 'ELIMINAR';
  entity: 'VENTA' | 'TRANSACCION_USD' | 'CLIENTE';
  entityId: string;
  details: string;
  user: string;
}

export type Page =
  | 'dashboard'
  | 'register-sale'
  | 'monthly-sales'
  | 'usd-transactions'
  | 'annual-summary'
  | 'global-search'
  | 'clients'
  | 'change-log';

export const MONTHS = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

export const MONTHS_SHORT = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

export const IPHONE_MODELS = [
  '11', '11 Pro', '11 Pro Max',
  '12 Mini', '12', '12 Pro', '12 Pro Max',
  '13 Mini', '13', '13 Pro', '13 Pro Max',
  '14', '14 Plus', '14 Pro', '14 Pro Max',
  '15', '15 Plus', '15 Pro', '15 Pro Max',
  '16', '16 Plus', '16 Pro', '16 Pro Max', '16e',
];

export const CAPACITIES = [64, 128, 256, 512, 1024];

export const COLORS_IPHONE = [
  'NEGRO', 'BLANCO', 'AZUL', 'ROJO', 'VERDE', 'DORADO',
  'PLATEADO', 'MORADO', 'ROSA', 'AMARILLO', 'TITANIO NATURAL',
  'TITANIO AZUL', 'TITANIO NEGRO', 'TITANIO BLANCO', 'GRIS ESPACIAL',
];

export const ACCESSORIES_OPTIONS = [
  'VIDRIO TEMPLADO', 'FUNDA SILICONA', 'FUNDA RIGIDA', 'CARGADOR',
  'CABLE USB-C', 'CABLE LIGHTNING', 'AURICULARES', 'AIRPODS',
  'ADAPTADOR', 'CAJA ORIGINAL', 'MANUAL',
];

export const PAYMENT_METHODS = [
  'EFECTIVO', 'TRANSFERENCIA', 'MERCADO PAGO', 'TARJETA DÉBITO',
  'TARJETA CRÉDITO', 'CRYPTO', 'PERMUTA', 'MIXTO', 'OTRO',
];

export const OPERATIONS = [
  'TRANSFERENCIA', 'EFECTIVO', 'MERCADO PAGO', 'CRYPTO', 'OTRO',
];

export const generateId = (): string =>
  Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const addDays = (date: string, days: number): string => {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const formatARS = (value: number): string =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

export const formatUSD = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('es-AR').format(value);

export const formatDate = (date: string): string => {
  if (!date) return '';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateLong = (date: string): string => {
  if (!date) return '';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const daysUntil = (date: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date + 'T12:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};
