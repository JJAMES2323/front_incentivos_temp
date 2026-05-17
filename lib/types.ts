// Enum types
export type UserRole = 'ADMIN' | 'RH' | 'PRODUCCION';
export type OrderStatus = 'ABIERTA' | 'CERRADA' | 'CANCELADA';
export type TipoLog = 'INFO' | 'WARNING' | 'ERROR';

// Auth/user
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

// Employees
export interface Empleado {
  id: number;
  document: string;
  documentType?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  module?: string;
  active: boolean;
  createdAt?: string;
}

export interface EmpleadoFormData {
  documentType: string;
  document: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  module?: string;
}

// References
export interface Referencia {
  id: number;
  reference: string;
  color: string;
  size: string;
  standardTime: number;
  description?: string;
  active: boolean;
  createdAt?: string;
}

export interface ReferenciaFormData {
  reference: string;
  color: string;
  size: string;
  standardTime: number;
  description?: string;
}

// Orders
export interface Orden {
  id: number;
  referenceId: number;
  quantity: number;
  quantityPending: number;
  module: string;
  status: OrderStatus;
  createdAt?: string;
  reference?: Referencia;
}

export interface OrdenFormData {
  referenceId: number;
  quantity: number;
  module: string;
  status: OrderStatus;
}

// Production records
export interface Registro {
  id: number;
  orderId: number;
  referenceId: number;
  module: string;
  units: number;
  standardTime: number;
  totalTime: number;
  createdAt?: string;
  order?: Orden;
  reference?: Referencia;
}

export interface RegistroFormData {
  orderId: number;
  units: number;
}

// Liquidations
export interface Liquidacion {
  id: number;
  module: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  createdUser: string;
}

export interface LiquidacionDetalle {
  id: number;
  liquidationId: number;
  employeeId: number;
  module: string;
  workDate: string;
  workedMinutes: number;
  downtimeMinutes: number;
  producedMinutes: number;
  efficiency: number;
  incentiveBase: number;
  payment: number;
  createdAt?: string;
}

export interface LiquidacionFormData {
  module: string;
  startDate: string;
  endDate: string;
  createdUser: string;
}

// Work logs
export interface WorkLog {
  id: number;
  employeeId: number;
  module: string;
  workDate: string;
  minutesWorked: number;
  minutesDowntime: number;
  employee?: Empleado;
}

export interface WorkLogFormData {
  employeeId: number;
  module: string;
  workDate: string;
  minutesWorked: number;
  minutesDowntime: number;
}

// Navigation types
export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}
