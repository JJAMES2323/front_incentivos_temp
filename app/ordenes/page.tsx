'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import ProtectedLayout from '@/components/ProtectedLayout';
import PageHeader from '@/components/PageHeader';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusChip, { getOrderStatusLabel, getOrderStatusType } from '@/components/StatusChip';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getErrorMessage } from '@/lib/utils';
import { empleadosApi, ordenesApi, referenciasApi } from '@/lib/api';
import { Empleado, Orden, Referencia } from '@/lib/types';
import OrdenFormDialog from './OrdenFormDialog';

export default function OrdenesPage() {
  const { showSuccess, showError } = useSnackbar();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ordenToDelete, setOrdenToDelete] = useState<Orden | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordenesResponse, referenciasResponse, empleadosResponse] = await Promise.all([
        ordenesApi.getAll(),
        referenciasApi.getAll(),
        empleadosApi.getAll(),
      ]);

      setReferencias(referenciasResponse.data);
      setEmpleados(empleadosResponse.data);

      const referenceMap = new Map(referenciasResponse.data.map((reference) => [reference.id, reference]));
      setOrdenes(
        ordenesResponse.data.map((orden) => ({
          ...orden,
          reference: referenceMap.get(orden.referenceId),
        }))
      );
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: GridColDef<Orden>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'reference',
      headerName: 'Referencia',
      flex: 1,
      minWidth: 220,
      valueGetter: (_value, row) =>
        row.reference
          ? `${row.reference.reference} / ${row.reference.color} / ${row.reference.size}`
          : `#${row.referenceId}`,
    },
    { field: 'module', headerName: 'Módulo', width: 120 },
    { field: 'quantity', headerName: 'Cantidad', width: 110, type: 'number' },
    { field: 'quantityPending', headerName: 'Pendiente', width: 110, type: 'number' },
    {
      field: 'status',
      headerName: 'Estado',
      width: 130,
      renderCell: (params: GridRenderCellParams<Orden>) => (
        <StatusChip
          label={getOrderStatusLabel(params.row.status)}
          status={getOrderStatusType(params.row.status)}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Creada',
      width: 170,
      renderCell: (params: GridRenderCellParams<Orden>) =>
        params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Orden>) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => {
              setSelectedOrden(params.row);
              setFormOpen(true);
            }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancelar">
            <IconButton size="small" color="error" onClick={() => {
              setOrdenToDelete(params.row);
              setDeleteDialogOpen(true);
            }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!ordenToDelete) return;

    try {
      setIsDeleting(true);
      await ordenesApi.delete(ordenToDelete.id);
      showSuccess('Orden cancelada correctamente');
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cancelar orden');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setOrdenToDelete(null);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'PRODUCCION']}>
      <PageHeader
        title="Órdenes de Producción"
        subtitle="Gestión de órdenes activas y cerradas"
        onAddClick={() => {
          setSelectedOrden(null);
          setFormOpen(true);
        }}
        addButtonText="Nueva Orden"
      />

      <EnhancedDataTable rows={ordenes} columns={columns} loading={loading} />

      <OrdenFormDialog
        open={formOpen}
        orden={selectedOrden}
        referencias={referencias}
        onClose={() => {
          setFormOpen(false);
          setSelectedOrden(null);
        }}
        onSuccess={async () => {
          setFormOpen(false);
          setSelectedOrden(null);
          await fetchData();
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Cancelar Orden"
        message={`¿Desea cancelar la orden #${ordenToDelete?.id}?`}
        confirmText="Cancelar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </ProtectedLayout>
  );
}
