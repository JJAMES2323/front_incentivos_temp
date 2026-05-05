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
import { usersApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { User, UserFormData, UserRole } from '@/lib/types';

interface UserFormDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'RH', label: 'Recursos Humanos' },
  { value: 'PRODUCCION', label: 'Producción' },
];

export default function UserFormDialog({ open, user, onClose, onSuccess }: UserFormDialogProps) {
  const { showSuccess, showError } = useSnackbar();
  const isEditing = Boolean(user);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActivationUserId, setPendingActivationUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'PRODUCCION',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  useEffect(() => {
    if (!open) return;

    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'PRODUCCION',
      });
    }

    setErrors({});
    setPendingActivationUserId(null);
  }, [open, user]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.name.trim()) nextErrors.name = 'El nombre es requerido';
    if (!formData.email.trim()) {
      nextErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'El correo debe tener formato válido';
    }

    if (!isEditing && !formData.password) {
      nextErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      nextErrors.password = 'Mínimo 6 caracteres';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      const payload: UserFormData = {
        ...formData,
        password: formData.password || undefined,
      };

      if (isEditing && user) {
        await usersApi.update(user.id, payload);
        showSuccess('Usuario actualizado correctamente');
      } else {
        const response = await usersApi.create(payload);
        const data = response.data as { requiresActivation?: boolean; userId?: number; message?: string };

        if (data.requiresActivation && data.userId) {
          setPendingActivationUserId(data.userId);
          return;
        } else {
          showSuccess('Usuario creado correctamente');
        }
      }

      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      showError(message || (isEditing ? 'Error al actualizar usuario' : 'Error al crear usuario'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmActivation = async () => {
    if (!pendingActivationUserId) return;

    try {
      setIsLoading(true);
      await usersApi.activate(pendingActivationUserId);
      showSuccess('Usuario reactivado correctamente');
      setPendingActivationUserId(null);
      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      showError(message || 'Error al reactivar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FormDialog
        open={open}
        title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onClose={onClose}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
          />
          <TextField
            label="Correo"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
            disabled={isEditing}
          />
          <TextField
            label={isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            required={!isEditing}
          />
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.role}
              label="Rol"
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={pendingActivationUserId !== null}
        title="Usuario Inactivo"
        message={`Ya existe un usuario inactivo con el correo "${formData.email}". ¿Desea reactivarlo?`}
        confirmText="Reactivar"
        onConfirm={handleConfirmActivation}
        onCancel={() => setPendingActivationUserId(null)}
        isLoading={isLoading}
      />
    </>
  );
}
