'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import FormDialog from '@/components/FormDialog';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { empleadosApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Empleado, EmpleadoFormData } from '@/lib/types';

const documentTypeOptions = ['DNI', 'RUC', 'CE', 'PASAPORTE'];
const moduleOptions = ['M1', 'M2'];

interface EmpleadoFormDialogProps {
  open: boolean;
  empleado: Empleado | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmpleadoFormDialog({ open, empleado, onClose, onSuccess }: EmpleadoFormDialogProps) {
  const { showSuccess, showError } = useSnackbar();
  const isEditing = Boolean(empleado);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EmpleadoFormData>({
    documentType: '',
    document: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    module: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmpleadoFormData, string>>>({});
  const [pendingActivationEmployeeId, setPendingActivationEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    if (empleado) {
      setFormData({
        documentType: empleado.documentType || '',
        document: empleado.document,
        name: empleado.name,
        address: empleado.address || '',
        phone: empleado.phone || '',
        email: empleado.email || '',
        module: empleado.module || '',
      });
    } else {
      setFormData({
        documentType: '',
        document: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        module: '',
      });
    }

    setErrors({});
  }, [open, empleado]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof EmpleadoFormData, string>> = {};

    if (!formData.document?.trim()) {
  nextErrors.document = 'El documento es requerido';
} else if (!/^\d+$/.test(formData.document)) {
  nextErrors.document = 'El documento solo debe contener números';
}

    //if (!formData.documentType.trim()) nextErrors.documentType = 'El tipo de documento es requerido';
    if (!formData.document?.trim()) nextErrors.document = 'El documento es requerido';
    if (!formData.name.trim()) {
      nextErrors.name = 'El nombre es requerido';
    } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(formData.name)) {
      nextErrors.name = 'El nombre no debe contener números ni símbolos';
    }
    if (!formData.module?.trim()) nextErrors.module = 'El módulo es requerido';

    if (!isEditing && !formData.email?.trim()) {
      nextErrors.email = 'El correo es requerido';
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'El correo debe tener formato válido';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      if (isEditing && empleado) {
        const updateData: Partial<EmpleadoFormData> = {};
        if (formData.documentType) updateData.documentType = formData.documentType;
        if (formData.name) updateData.name = formData.name;
        if (formData.address) updateData.address = formData.address;
        if (formData.phone) updateData.phone = formData.phone;
        if (formData.email) updateData.email = formData.email;
        if (formData.module) updateData.module = formData.module;
        await empleadosApi.update(empleado.id, updateData);
        showSuccess('Empleado actualizado correctamente');
      } else {
        const cleanData: Partial<EmpleadoFormData> = { ...formData, documentType: formData.documentType };
        if (!cleanData.address?.trim()) delete cleanData.address;
        if (!cleanData.phone?.trim()) delete cleanData.phone;
        if (!cleanData.email?.trim()) delete cleanData.email;
        const response = await empleadosApi.create(cleanData as EmpleadoFormData);
        const data = response.data as { requiresActivation?: boolean; employeeId?: number; message?: string };

        if (data.requiresActivation && data.employeeId) {
          setPendingActivationEmployeeId(data.employeeId);
          return;
        }

        showSuccess('Empleado creado correctamente');
      }

      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      showError(message || (isEditing ? 'Error al actualizar empleado' : 'Error al crear empleado'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmActivation = async () => {
    if (!pendingActivationEmployeeId) return;

    try {
      setIsLoading(true);
      await empleadosApi.activate(pendingActivationEmployeeId);
      showSuccess('Empleado reactivado correctamente');
      setPendingActivationEmployeeId(null);
      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      showError(message || 'Error al reactivar empleado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FormDialog
        open={open}
        title={isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onClose={onClose}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth error={!!errors.documentType} required>
          <InputLabel>Tipo de Documento</InputLabel>
          <Select
            value={formData.documentType}
            label="Tipo de Documento"
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
          >
            {documentTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          {errors.documentType && (
            <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
              {errors.documentType}
            </Box>
          )}
        </FormControl>
        <TextField
          label="Documento"
          value={formData.document}
          onChange={(e) => setFormData({ ...formData, document: e.target.value })}
          error={!!errors.document}
          helperText={errors.document}
          disabled={isEditing}
          fullWidth
          required
        />
        <TextField
          label="Nombre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          required
        />
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
          label="Correo"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          required={!isEditing}
        />
        <TextField
          label="Teléfono"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          fullWidth
        />
        <TextField
          label="Dirección"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          fullWidth
          multiline
          rows={2}
        />
      </Box>
    </FormDialog>

      <ConfirmDialog
        open={pendingActivationEmployeeId !== null}
        title="Empleado Inactivo"
        message={`Ya existe un empleado inactivo con el documento "${formData.document}". ¿Desea reactivarlo?`}
        confirmText="Reactivar"
        onConfirm={handleConfirmActivation}
        onCancel={() => setPendingActivationEmployeeId(null)}
        isLoading={isLoading}
      />
    </>
  );
}
