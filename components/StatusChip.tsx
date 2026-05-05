'use client';

import Chip from '@mui/material/Chip';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusChipProps {
  label: string;
  status: StatusType;
}

const statusColors: Record<StatusType, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  default: 'default',
};

export default function StatusChip({ label, status }: StatusChipProps) {
  return (
    <Chip
      label={label}
      color={statusColors[status]}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );
}

// Helper to get status type from order state
export function getOrderStatusType(estado: string): StatusType {
  switch (estado) {
    case 'CERRADA':
      return 'success';
    case 'ABIERTA':
      return 'warning';
    case 'CANCELADA':
      return 'error';
    default:
      return 'default';
  }
}

// Helper to get status type from active state
export function getActiveStatusType(activo: boolean): StatusType {
  return activo ? 'success' : 'error';
}

// Helper to get status label from order state
export function getOrderStatusLabel(estado: string): string {
  switch (estado) {
    case 'CERRADA':
      return 'Cerrada';
    case 'ABIERTA':
      return 'Abierta';
    case 'CANCELADA':
      return 'Cancelada';
    default:
      return estado;
  }
}

// Helper to get liquidation status
export function getLiquidacionStatusType(estado: string): StatusType {
  return estado === 'PAGADA' ? 'success' : 'warning';
}
