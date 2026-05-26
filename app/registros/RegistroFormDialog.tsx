'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormDialog from '@/components/FormDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { registrosApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Orden, Registro } from '@/lib/types';

interface RegistroFormDialogProps {
  open: boolean;
  registro: Registro | null;
  ordenes: Orden[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistroFormDialog({
  open,
  registro,
  ordenes,
  onClose,
  onSuccess,
}: RegistroFormDialogProps) {
  const { showSuccess, showError } = useSnackbar();
  const { mode } = useTheme();
  const isEditing = Boolean(registro);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null);
  const [formData, setFormData] = useState({
    orderId: 0,
    units: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    if (registro) {
      setFormData({
        orderId: registro.orderId,
        units: String(registro.units),
      });
    } else {
      setFormData({
        orderId: 0,
        units: '',
      });
    }

    setErrors({});
    setSelectedOrder(null);
  }, [open, registro]);

  useEffect(() => {
    if (formData.orderId) {
      const order = ordenes.find(o => o.id === formData.orderId);
      setSelectedOrder(order || null);
    } else {
      setSelectedOrder(null);
    }
  }, [formData.orderId, ordenes]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const unitsNum = Number(formData.units);
    if (!formData.orderId) nextErrors.orderId = 'Seleccione una orden';
    if (!formData.units || unitsNum <= 0) nextErrors.units = 'Las unidades deben ser mayores que 0';
    if (selectedOrder && unitsNum > selectedOrder.quantityPending) {
      nextErrors.units = `Las unidades no pueden exceder la cantidad pendiente (${selectedOrder.quantityPending})`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      if (isEditing && registro) {
        await registrosApi.update(registro.id, { units: Number(formData.units) });
        showSuccess('Registro actualizado correctamente');
      } else {
        await registrosApi.create({ orderId: formData.orderId, units: Number(formData.units) });
        showSuccess('Registro creado correctamente');
      }

      onSuccess();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || (isEditing ? 'Error al actualizar registro' : 'Error al crear registro'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? 'Editar Registro' : 'Nuevo Registro'}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <FormControl fullWidth error={!!errors.orderId} required>
          <InputLabel>Orden</InputLabel>
          <Select
            value={formData.orderId || ''}
            label="Orden"
            disabled={isEditing}
            onChange={(e) => setFormData({ ...formData, orderId: Number(e.target.value) })}
          >
            {ordenes.map((orden) => (
              <MenuItem key={orden.id} value={orden.id}>
                #{orden.id} - {orden.reference ? `${orden.reference.reference} / ${orden.reference.color} / ${orden.reference.size}` : `Ref ${orden.referenceId}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Unidades"
          type="number"
          value={formData.units}
          onChange={(e) => setFormData({ ...formData, units: e.target.value })}
          error={!!errors.units}
          helperText={errors.units}
          fullWidth
          required
        />
        {selectedOrder && (
          <Box sx={{ mt: 2, p: 2, bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Información de la Orden
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Referencia"
                value={selectedOrder.reference ? `${selectedOrder.reference.reference} / ${selectedOrder.reference.color} / ${selectedOrder.reference.size}` : `Ref ${selectedOrder.referenceId}`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Módulo"
                value={selectedOrder.module}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Cantidad Total"
                value={selectedOrder.quantity}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Cantidad Pendiente"
                value={selectedOrder.quantityPending}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Estado"
                value={selectedOrder.status}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Box>
          </Box>
        )}
      </Box>
    </FormDialog>
  );
}
