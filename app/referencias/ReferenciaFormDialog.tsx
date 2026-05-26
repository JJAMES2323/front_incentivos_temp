'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormDialog from '@/components/FormDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { referenciasApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Referencia, ReferenciaFormData } from '@/lib/types';

interface ReferenciaFormDialogProps {
  open: boolean;
  referencia: Referencia | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReferenciaFormDialog({ open, referencia, onClose, onSuccess }: ReferenciaFormDialogProps) {
  const { showSuccess, showError } = useSnackbar();
  const isEditing = Boolean(referencia);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ReferenciaFormData>({
    reference: '',
    color: '',
    size: '',
    standardTime: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ReferenciaFormData, string>>>({});

  useEffect(() => {
    if (!open) return;

    if (referencia) {
      setFormData({
        reference: referencia.reference,
        color: referencia.color,
        size: referencia.size,
        standardTime: String(referencia.standardTime),
        description: referencia.description || '',
      });
    } else {
      setFormData({
        reference: '',
        color: '',
        size: '',
        standardTime: '',
        description: '',
      });
    }

    setErrors({});
  }, [open, referencia]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof ReferenciaFormData, string>> = {};

    if (!formData.reference.trim()) nextErrors.reference = 'La referencia es requerida';
    if (!formData.color.trim()) nextErrors.color = 'El color es requerido';
    if (!formData.size.trim()) nextErrors.size = 'La talla es requerida';
    const st = Number(formData.standardTime);
    if (isNaN(st) || st <= 0) nextErrors.standardTime = 'Debe ser mayor que 0';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      if (isEditing && referencia) {
        await referenciasApi.update(referencia.id, {
          standardTime: Number(formData.standardTime),
          description: formData.description,
        });
        showSuccess('Referencia actualizada correctamente');
      } else {
        const response = await referenciasApi.create({
          ...formData,
          standardTime: Number(formData.standardTime),
        });
        const data = response.data as { requiresActivation?: boolean; referenceId?: number; message?: string };

        if (data.requiresActivation && data.referenceId) {
          await referenciasApi.activate(data.referenceId);
          showSuccess('Referencia reactivada correctamente');
        } else {
          showSuccess('Referencia creada correctamente');
        }
      }

      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      showError(message || (isEditing ? 'Error al actualizar referencia' : 'Error al crear referencia'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? 'Editar Referencia' : 'Nueva Referencia'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Referencia"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          error={!!errors.reference}
          helperText={errors.reference}
          disabled={isEditing}
          fullWidth
          required
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            error={!!errors.color}
            helperText={errors.color}
            disabled={isEditing}
            fullWidth
            required
          />
          <TextField
            label="Talla"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            error={!!errors.size}
            helperText={errors.size}
            disabled={isEditing}
            fullWidth
            required
          />
        </Box>
        <TextField
          label="Tiempo estándar"
          type="number"
          value={formData.standardTime}
          onChange={(e) => setFormData({ ...formData, standardTime: e.target.value })}
          error={!!errors.standardTime}
          helperText={errors.standardTime}
          fullWidth
          required
        />
        <TextField
          label="Descripción"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
        />
      </Box>
    </FormDialog>
  );
}
