'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ProtectedLayout from '@/components/ProtectedLayout';
import PageHeader from '@/components/PageHeader';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusChip, { getActiveStatusType } from '@/components/StatusChip';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getErrorMessage } from '@/lib/utils';
import { usersApi } from '@/lib/api';
import { User, UserRole } from '@/lib/types';
import UserFormDialog from './UserFormDialog';

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  RH: 'Recursos Humanos',
  PRODUCCION: 'Producción',
};

export default function UsuariosPage() {
  const { showSuccess, showError } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [userToActivate, setUserToActivate] = useState<User | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns: GridColDef<User>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Rol',
      width: 170,
      renderCell: (params: GridRenderCellParams<User>) =>
        roleLabels[params.row.role] || params.row.role,
    },
    {
      field: 'active',
      headerName: 'Estado',
      width: 120,
      renderCell: (params: GridRenderCellParams<User>) => (
        <StatusChip
          label={params.row.active ? 'Activo' : 'Inactivo'}
          status={getActiveStatusType(Boolean(params.row.active))}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box>
          {params.row.active ? (
            <>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => {
                  setSelectedUser(params.row);
                  setFormOpen(true);
                }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Desactivar">
                <IconButton size="small" color="error" onClick={() => {
                  setUserToDelete(params.row);
                  setDeleteDialogOpen(true);
                }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Activar">
              <IconButton size="small" color="primary" onClick={() => {
                setUserToActivate(params.row);
                setActivateDialogOpen(true);
              }}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await usersApi.delete(userToDelete.id);
      showSuccess('Usuario desactivado correctamente');
      await fetchUsers();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al desactivar usuario');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleActivateConfirm = async () => {
    if (!userToActivate) return;

    try {
      setIsActivating(true);
      await usersApi.activate(userToActivate.id);
      showSuccess('Usuario activado correctamente');
      await fetchUsers();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al activar usuario');
    } finally {
      setIsActivating(false);
      setActivateDialogOpen(false);
      setUserToActivate(null);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['ADMIN']}>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de usuarios del sistema"
        onAddClick={() => {
          setSelectedUser(null);
          setFormOpen(true);
        }}
        addButtonText="Nuevo Usuario"
      />

      <EnhancedDataTable rows={users} columns={columns} loading={loading} />

      <UserFormDialog
        open={formOpen}
        user={selectedUser}
        onClose={() => {
          setFormOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={async () => {
          setFormOpen(false);
          setSelectedUser(null);
          await fetchUsers();
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Desactivar Usuario"
        message={`¿Desea desactivar al usuario "${userToDelete?.name}"?`}
        confirmText="Desactivar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <ConfirmDialog
        open={activateDialogOpen}
        title="Activar Usuario"
        message={`¿Desea activar al usuario "${userToActivate?.name}"?`}
        confirmText="Activar"
        isLoading={isActivating}
        onConfirm={handleActivateConfirm}
        onCancel={() => setActivateDialogOpen(false)}
      />
    </ProtectedLayout>
  );
}
