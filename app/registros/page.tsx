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
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getErrorMessage } from '@/lib/utils';
import { ordenesApi, referenciasApi, registrosApi } from '@/lib/api';
import { Orden, Referencia, Registro } from '@/lib/types';
import RegistroFormDialog from './RegistroFormDialog';

export default function RegistrosPage() {
  const { showSuccess, showError } = useSnackbar();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registroToDelete, setRegistroToDelete] = useState<Registro | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [registrosResponse, ordenesResponse, referenciasResponse] = await Promise.all([
        registrosApi.getAll(),
        ordenesApi.getAll(),
        referenciasApi.getAll(),
      ]);

      const referenceMap = new Map(referenciasResponse.data.map((reference) => [reference.id, reference]));
      const orderMap = new Map(
        ordenesResponse.data.map((order) => [
          order.id,
          {
            ...order,
            reference: referenceMap.get(order.referenceId),
          },
        ])
      );

      setReferencias(referenciasResponse.data);
      setOrdenes(Array.from(orderMap.values()));
      setRegistros(
        registrosResponse.data.map((registro) => ({
          ...registro,
          order: orderMap.get(registro.orderId),
          reference: referenceMap.get(registro.referenceId),
        }))
      );
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cargar registros de producción');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: GridColDef<Registro>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'orderId',
      headerName: 'Orden',
      width: 100,
      valueGetter: (_value, row) => `#${row.orderId}`,
    },
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
    { field: 'units', headerName: 'Unidades', width: 110, type: 'number' },
    { field: 'standardTime', headerName: 'T. estándar', width: 120, type: 'number' },
    { field: 'totalTime', headerName: 'T. total', width: 110, type: 'number' },
    {
      field: 'createdAt',
      headerName: 'Fecha',
      width: 170,
      renderCell: (params: GridRenderCellParams<Registro>) =>
        params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Registro>) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => {
              setSelectedRegistro(params.row);
              setFormOpen(true);
            }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => {
              setRegistroToDelete(params.row);
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
    if (!registroToDelete) return;

    try {
      setIsDeleting(true);
      await registrosApi.delete(registroToDelete.id);
      showSuccess('Registro eliminado correctamente');
      await fetchData();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al eliminar registro');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setRegistroToDelete(null);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'PRODUCCION']}>
      <PageHeader
        title="Registros de Producción"
        subtitle="Registro de producción por orden"
        onAddClick={() => {
          setSelectedRegistro(null);
          setFormOpen(true);
        }}
        addButtonText="Nuevo Registro"
      />

      <EnhancedDataTable rows={registros} columns={columns} loading={loading} />

      <RegistroFormDialog
        open={formOpen}
        registro={selectedRegistro}
        ordenes={ordenes}
        onClose={() => {
          setFormOpen(false);
          setSelectedRegistro(null);
        }}
        onSuccess={async () => {
          setFormOpen(false);
          setSelectedRegistro(null);
          await fetchData();
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Registro"
        message="¿Desea eliminar este registro de producción?"
        confirmText="Eliminar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </ProtectedLayout>
  );
}
