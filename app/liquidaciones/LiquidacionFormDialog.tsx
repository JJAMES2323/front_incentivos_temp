'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import FormDialog from '@/components/FormDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { liquidacionesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import dayjs from 'dayjs';

const moduleOptions = ['M1', 'M2'];

interface LiquidacionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LiquidacionFormDialog({ open, onClose, onSuccess }: LiquidacionFormDialogProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    module: moduleOptions[0],
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    setFormData((current) => ({
      ...current,
      module: current.module || moduleOptions[0],
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    }));
    setErrors({});
  }, [open]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.module.trim()) nextErrors.module = 'Seleccione un módulo';
    if (!formData.startDate) nextErrors.startDate = 'La fecha inicial es requerida';
    if (!formData.endDate) nextErrors.endDate = 'La fecha final es requerida';
    if (formData.startDate && formData.endDate && dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
      nextErrors.endDate = 'La fecha final debe ser posterior o igual a la inicial';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      await liquidacionesApi.create({
        module: formData.module,
        startDate: formData.startDate,
        endDate: formData.endDate,
        createdUser: user?.name || user?.email || 'Sistema',
      });
      showSuccess('Liquidación generada correctamente');
      onSuccess();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al generar liquidación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title="Nueva Liquidación"
      submitText="Generar"
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Fecha inicial"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            error={!!errors.startDate}
            helperText={errors.startDate}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Fecha final"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            error={!!errors.endDate}
            helperText={errors.endDate}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </Box>
    </FormDialog>
  );
}
