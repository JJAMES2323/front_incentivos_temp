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
import { empleadosApi } from '@/lib/api';
import { Empleado } from '@/lib/types';
import EmpleadoFormDialog from './EmpleadoFormDialog';

export default function EmpleadosPage() {
  const { showSuccess, showError } = useSnackbar();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<Empleado | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [empleadoToActivate, setEmpleadoToActivate] = useState<Empleado | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      const response = await empleadosApi.getAll();
      setEmpleados(response.data);
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const columns: GridColDef<Empleado>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'document', headerName: 'Documento', width: 140 },
    { field: 'documentType', headerName: 'Tipo Documento', width: 140 },
    { field: 'name', headerName: 'Nombre', flex: 1, minWidth: 180 },
    { field: 'module', headerName: 'Módulo', width: 120 },
    { field: 'email', headerName: 'Correo', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Teléfono', width: 140 },
    { field: 'address', headerName: 'Dirección', flex: 1, minWidth: 200 },
    {
      field: 'active',
      headerName: 'Estado',
      width: 120,
      renderCell: (params: GridRenderCellParams<Empleado>) => (
        <StatusChip
          label={params.row.active ? 'Activo' : 'Inactivo'}
          status={getActiveStatusType(params.row.active)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Empleado>) => (
        <Box>
              {params.row.active ? (
            <>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => {
                  setSelectedEmpleado(params.row);
                  setFormOpen(true);
                }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Desactivar">
                <IconButton size="small" color="error" onClick={() => {
                  setEmpleadoToDelete(params.row);
                  setDeleteDialogOpen(true);
                }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Activar">
              <IconButton size="small" color="primary" onClick={() => {
                setEmpleadoToActivate(params.row);
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
    if (!empleadoToDelete) return;

    try {
      setIsDeleting(true);
      await empleadosApi.delete(empleadoToDelete.id);
      showSuccess('Empleado desactivado correctamente');
      await fetchEmpleados();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al desactivar empleado');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setEmpleadoToDelete(null);
    }
  };

  const handleActivateConfirm = async () => {
    if (!empleadoToActivate) return;

    try {
      setIsActivating(true);
      await empleadosApi.activate(empleadoToActivate.id);
      showSuccess('Empleado activado correctamente');
      await fetchEmpleados();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al activar empleado');
    } finally {
      setIsActivating(false);
      setActivateDialogOpen(false);
      setEmpleadoToActivate(null);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'RH']}>
      <PageHeader
        title="Empleados"
        subtitle="Gestión de empleados"
        onAddClick={() => {
          setSelectedEmpleado(null);
          setFormOpen(true);
        }}
        addButtonText="Nuevo Empleado"
      />

      <EnhancedDataTable rows={empleados} columns={columns} loading={loading} />

      <EmpleadoFormDialog
        open={formOpen}
        empleado={selectedEmpleado}
        onClose={() => {
          setFormOpen(false);
          setSelectedEmpleado(null);
        }}
        onSuccess={async () => {
          setFormOpen(false);
          setSelectedEmpleado(null);
          await fetchEmpleados();
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Desactivar Empleado"
        message={`¿Desea desactivar a "${empleadoToDelete?.name}"?`}
        confirmText="Desactivar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <ConfirmDialog
        open={activateDialogOpen}
        title="Activar Empleado"
        message={`¿Desea activar al empleado "${empleadoToActivate?.name}"?`}
        confirmText="Activar"
        isLoading={isActivating}
        onConfirm={handleActivateConfirm}
        onCancel={() => setActivateDialogOpen(false)}
      />
    </ProtectedLayout>
  );
}
