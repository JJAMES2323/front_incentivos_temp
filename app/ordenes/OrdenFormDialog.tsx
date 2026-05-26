'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import FormDialog from '@/components/FormDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { ordenesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { OrderStatus, Orden, Referencia } from '@/lib/types';

const moduleOptions = ['M1', 'M2'];

interface OrdenFormDialogProps {
  open: boolean;
  orden: Orden | null;
  referencias: Referencia[];
  onClose: () => void;
  onSuccess: () => void;
}

const statuses: { value: OrderStatus; label: string }[] = [
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'CERRADA', label: 'Cerrada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export default function OrdenFormDialog({
  open,
  orden,
  referencias,
  onClose,
  onSuccess,
}: OrdenFormDialogProps) {
  const { showSuccess, showError } = useSnackbar();
  const isEditing = Boolean(orden);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    referenceId: 0,
    quantity: '',
    module: '',
    status: 'ABIERTA' as OrderStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    if (orden) {
      setFormData({
        referenceId: orden.referenceId,
        quantity: String(orden.quantity),
        module: orden.module,
        status: orden.status,
      });
    } else {
      setFormData({
        referenceId: 0,
        quantity: '',
        module: moduleOptions[0],
        status: 'ABIERTA',
      });
    }

    setErrors({});
  }, [open, orden]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.referenceId) nextErrors.referenceId = 'Seleccione una referencia';
    if (!formData.quantity || Number(formData.quantity) <= 0) nextErrors.quantity = 'La cantidad debe ser mayor que 0';
    if (!formData.module.trim()) nextErrors.module = 'Seleccione un módulo';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      if (isEditing && orden) {
        await ordenesApi.update(orden.id, {
          quantity: Number(formData.quantity),
          module: formData.module,
          status: formData.status,
        });
        showSuccess('Orden actualizada correctamente');
      } else {
        await ordenesApi.create({
          referenceId: formData.referenceId,
          quantity: Number(formData.quantity),
          module: formData.module,
        });
        showSuccess('Orden creada correctamente');
      }

      onSuccess();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || (isEditing ? 'Error al actualizar orden' : 'Error al crear orden'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? 'Editar Orden' : 'Nueva Orden'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <FormControl fullWidth error={!!errors.referenceId} required>
          <InputLabel>Referencia</InputLabel>
          <Select
            value={formData.referenceId || ''}
            label="Referencia"
            disabled={isEditing}
            onChange={(e) => setFormData({ ...formData, referenceId: Number(e.target.value) })}
          >
            {referencias.map((reference) => (
              <MenuItem key={reference.id} value={reference.id}>
                {reference.reference} / {reference.color} / {reference.size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth error={!!errors.module} required>
          <InputLabel>Módulo</InputLabel>
          <Select
            value={formData.module}
            label="Módulo"
            onChange={(e) => setFormData({ ...formData, module: e.target.value })}
          >
            {moduleOptions.map((module) => (
              <MenuItem key={module} value={module}>
                {module}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Cantidad"
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          error={!!errors.quantity}
          helperText={errors.quantity}
          fullWidth
          required
        />
        {isEditing && (
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={formData.status}
              label="Estado"
              onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </FormDialog>
  );
}
