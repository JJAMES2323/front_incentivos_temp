import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  Empleado,
  EmpleadoFormData,
  Liquidacion,
  LiquidacionDetalle,
  LiquidacionFormData,
  Orden,
  OrdenFormData,
  Referencia,
  ReferenciaFormData,
  Registro,
  RegistroFormData,
  User,
  UserFormData,
  WorkLog,
  WorkLogFormData,
} from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const STORAGE_KEYS = {
  token: 'auth_token',
  user: 'auth_user',
} as const;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = null;

const normalizeNumber = (value: unknown) => Number(value ?? 0);

const normalizeUser = (user: Record<string, unknown>): User => ({
  id: Number(user.id),
  name: String(user.name ?? ''),
  email: String(user.email ?? ''),
  role: String(user.role ?? '') as User['role'],
  active: Boolean(user.active ?? true),
  createdAt: user.created_at ? String(user.created_at) : undefined,
});

const normalizeEmpleado = (employee: Record<string, unknown>): Empleado => ({
  id: Number(employee.id),
  documentType: employee.document_type ? String(employee.document_type) : '',
  document: String(employee.document ?? ''),
  name: String(employee.name ?? ''),
  address: employee.address ? String(employee.address) : '',
  phone: employee.phone ? String(employee.phone) : '',
  email: employee.email ? String(employee.email) : '',
  module: employee.module ? String(employee.module) : '',
  active: Boolean(employee.active ?? true),
  createdAt: employee.created_at ? String(employee.created_at) : undefined,
});

const normalizeReferencia = (reference: Record<string, unknown>): Referencia => ({
  id: Number(reference.id),
  reference: String(reference.reference ?? ''),
  color: String(reference.color ?? ''),
  size: String(reference.size ?? ''),
  standardTime: normalizeNumber(reference.standard_time),
  description: reference.description ? String(reference.description) : '',
  active: Boolean(reference.active ?? true),
  createdAt: reference.created_at ? String(reference.created_at) : undefined,
});

const normalizeOrden = (order: Record<string, unknown>): Orden => {
  const rawStatus = String(order.status ?? 'ABIERTA').toUpperCase();
  const status = rawStatus === 'CANCELLED' ? 'CANCELADA' : rawStatus;

  return {
    id: Number(order.id),
    referenceId: Number(order.reference_id),
    quantity: Number(order.quantity ?? 0),
    quantityPending: Number(order.quantity_pending ?? 0),
    module: String(order.module ?? ''),
    status: status as Orden['status'],
    createdAt: order.created_at ? String(order.created_at) : undefined,
    reference: order.reference ? normalizeReferencia(order.reference as Record<string, unknown>) : undefined,
  };
};

const normalizeRegistro = (record: Record<string, unknown>): Registro => ({
  id: Number(record.id),
  orderId: Number(record.order_id),
  referenceId: Number(record.reference_id),
  module: String(record.module ?? ''),
  units: Number(record.units ?? 0),
  standardTime: normalizeNumber(record.standard_time ?? record.standar_time),
  totalTime: normalizeNumber(record.total_time),
  createdAt: record.created_at ? String(record.created_at) : undefined,
});

const normalizeLiquidacion = (liquidation: Record<string, unknown>): Liquidacion => ({
  id: Number(liquidation.id),
  module: String(liquidation.module ?? ''),
  startDate: String(liquidation.start_date ?? ''),
  endDate: String(liquidation.end_date ?? ''),
  createdAt: liquidation.created_at ? String(liquidation.created_at) : undefined,
  createdUser: String(liquidation.created_user ?? ''),
});

const normalizeLiquidacionDetalle = (detail: Record<string, unknown>): LiquidacionDetalle => ({
  id: Number(detail.id),
  liquidationId: Number(detail.liquidation_id),
  employeeId: Number(detail.employee_id),
  module: String(detail.module ?? ''),
  workDate: String(detail.work_date ?? ''),
  workedMinutes: Number(detail.worked_minutes ?? 0),
  downtimeMinutes: Number(detail.downtime_minutes ?? 0),
  producedMinutes: normalizeNumber(detail.produced_minutes),
  efficiency: normalizeNumber(detail.efficiency),
  incentiveBase: normalizeNumber(detail.incentive_base),
  payment: normalizeNumber(detail.payment),
  createdAt: detail.created_at ? String(detail.created_at) : undefined,
});

const normalizeWorkLog = (log: Record<string, unknown>): WorkLog => ({
  id: Number(log.id),
  employeeId: Number(log.employee_id),
  module: String(log.module ?? ''),
  workDate: String(log.work_date ?? ''),
  minutesWorked: Number(log.minutes_worked ?? 0),
  minutesDowntime: Number(log.minutes_downtime ?? 0),
});

const getDataArray = <T>(data: unknown, mapper: (item: Record<string, unknown>) => T): T[] => {
  const raw = Array.isArray(data)
    ? data
    : Array.isArray((data as { data?: unknown })?.data)
      ? (data as { data: unknown[] }).data
      : [];

  return raw.map((item) => mapper(item as Record<string, unknown>));
};

export const setToken = (token: string | null) => {
  accessToken = token;
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(STORAGE_KEYS.token, token);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.token);
  }
};

export const getToken = () => {
  if (accessToken) return accessToken;
  if (typeof window === 'undefined') return null;

  accessToken = window.localStorage.getItem(STORAGE_KEYS.token);
  return accessToken;
};

export const clearToken = () => {
  accessToken = null;
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEYS.token);
  }
};

export const setStoredUser = (user: User | null) => {
  if (typeof window === 'undefined') return;

  if (user) {
    window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.user);
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    window.localStorage.removeItem(STORAGE_KEYS.user);
    return null;
  }
};

export const clearStoredUser = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEYS.user);
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      clearStoredUser();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async login(email: string, password: string): Promise<{ data: AuthResponse }> {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data as { token: string; user: Record<string, unknown> };
    return {
      data: {
        token: data.token,
        user: normalizeUser(data.user),
      },
    };
  },
};

export const usersApi = {
  async getAll() {
    const response = await api.get('/users');
    return { ...response, data: getDataArray(response.data, normalizeUser) };
  },
  create: (data: UserFormData) =>
    api.post('/users', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      rol: data.role,
    }),
  update: (id: number, data: Partial<UserFormData>) =>
    api.put(`/users/${id}`, {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      rol: data.role,
    }),
  delete: (id: number) => api.delete(`/users/${id}`),
  activate: (id: number) => api.put(`/users/${id}/activate`),
};

export const empleadosApi = {
  async getAll() {
    const response = await api.get('/employees');
    return { ...response, data: getDataArray(response.data, normalizeEmpleado) };
  },
  create: (data: EmpleadoFormData) => api.post('/employees', data),
  update: (id: number, data: Partial<EmpleadoFormData>) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
  activate: (id: number) => api.put(`/employees/${id}/activate`),
};

export const referenciasApi = {
  async getAll() {
    const response = await api.get('/references');
    return { ...response, data: getDataArray(response.data, normalizeReferencia) };
  },
  create: (data: ReferenciaFormData) =>
    api.post('/references', {
      reference: data.reference,
      color: data.color,
      size: data.size,
      standard_time: data.standardTime,
      description: data.description,
    }),
  update: (id: number, data: Partial<ReferenciaFormData>) =>
    api.put(`/references/${id}`, {
      standard_time: data.standardTime,
      description: data.description,
    }),
  delete: (id: number) => api.delete(`/references/${id}`),
  activate: (id: number) => api.put(`/references/${id}/activate`),
};

export const ordenesApi = {
  async getAll() {
    const response = await api.get('/orders');
    return { ...response, data: getDataArray(response.data, normalizeOrden) };
  },
  async getById(id: number) {
    const response = await api.get(`/orders/${id}`);
    return { ...response, data: normalizeOrden(response.data) };
  },
  create: (data: Omit<OrdenFormData, 'status'>) =>
    api.post('/orders', {
      reference_id: data.referenceId,
      quantity: data.quantity,
      quantity_pending: data.quantity,
      module: data.module,
    }),
  update: (id: number, data: Partial<OrdenFormData>) =>
    api.put(`/orders/${id}`, {
      quantity: data.quantity,
      module: data.module,
      status: data.status,
    }),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

export const registrosApi = {
  async getAll() {
    const response = await api.get('/production');
    return { ...response, data: getDataArray(response.data, normalizeRegistro) };
  },
  create: (data: RegistroFormData) =>
    api.post('/production', {
      order_id: data.orderId,
      units: data.units,
    }),
  update: (id: number, data: Partial<RegistroFormData>) =>
    api.put(`/production/${id}`, {
      units: data.units,
    }),
  delete: (id: number) => api.delete(`/production/${id}`),
};

export const liquidacionesApi = {
  async getAll() {
    const response = await api.get('/liquidation');
    return { ...response, data: getDataArray(response.data, normalizeLiquidacion) };
  },
  async getById(id: number) {
    const response = await api.get(`/liquidation/${id}`);
    return { ...response, data: getDataArray(response.data, normalizeLiquidacionDetalle) };
  },
  create: (data: LiquidacionFormData) =>
    api.post('/liquidation', {
      module: data.module,
      start_date: data.startDate,
      end_date: data.endDate,
      created_user: data.createdUser,
    }),
};

export const workLogsApi = {
  async getAll() {
    const response = await api.get('/work-logs');
    return { ...response, data: getDataArray(response.data, normalizeWorkLog) };
  },
  create: (data: WorkLogFormData) =>
    api.post('/work-logs', {
      employee_id: data.employeeId,
      module: data.module,
      work_date: data.workDate,
      minutes_worked: data.minutesWorked,
      minutes_downtime: data.minutesDowntime,
    }),
  update: (id: number, data: Partial<WorkLogFormData>) =>
    api.put(`/work-logs/${id}`, {
      minutes_worked: data.minutesWorked,
      minutes_downtime: data.minutesDowntime,
    }),
  delete: (id: number) => api.delete(`/work-logs/${id}`),
};

export default api;
