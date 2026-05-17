'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ProtectedLayout from '@/components/ProtectedLayout';
import PageHeader from '@/components/PageHeader';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import StatusChip, { getActiveStatusType } from '@/components/StatusChip';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getErrorMessage } from '@/lib/utils';
import { referenciasApi } from '@/lib/api';
import { Referencia } from '@/lib/types';
import ReferenciaFormDialog from './ReferenciaFormDialog';

export default function ReferenciasPage() {
  const { showSuccess, showError } = useSnackbar();
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedReferencia, setSelectedReferencia] = useState<Referencia | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [referenciaToDelete, setReferenciaToDelete] = useState<Referencia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReferencias = useCallback(async () => {
    try {
      setLoading(true);
      const response = await referenciasApi.getAll();
      setReferencias(response.data);
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cargar referencias');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchReferencias();
  }, [fetchReferencias]);

  const columns: GridColDef<Referencia>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'reference', headerName: 'Referencia', width: 150 },
    { field: 'color', headerName: 'Color', width: 140 },
    { field: 'size', headerName: 'Talla', width: 110 },
    {
      field: 'standardTime',
      headerName: 'Tiempo Estándar',
      width: 150,
      type: 'number',
    },
    { field: 'description', headerName: 'Descripción', flex: 1, minWidth: 220 },
    {
      field: 'active',
      headerName: 'Estado',
      width: 120,
      renderCell: (params: GridRenderCellParams<Referencia>) => (
        <StatusChip
          label={params.row.active ? 'Activa' : 'Inactiva'}
          status={getActiveStatusType(params.row.active)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Referencia>) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => {
              setSelectedReferencia(params.row);
              setFormOpen(true);
            }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desactivar">
            <IconButton size="small" color="error" onClick={() => {
              setReferenciaToDelete(params.row);
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
    if (!referenciaToDelete) return;

    try {
      setIsDeleting(true);
      await referenciasApi.delete(referenciaToDelete.id);
      showSuccess('Referencia desactivada correctamente');
      await fetchReferencias();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al desactivar referencia');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setReferenciaToDelete(null);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'PRODUCCION']}>
      <PageHeader
        title="Referencias"
        subtitle="Gestión de referencias de producto"
        onAddClick={() => {
          setSelectedReferencia(null);
          setFormOpen(true);
        }}
        addButtonText="Nueva Referencia"
      />

      <EnhancedDataTable rows={referencias} columns={columns} loading={loading} />

      <ReferenciaFormDialog
        open={formOpen}
        referencia={selectedReferencia}
        onClose={() => {
          setFormOpen(false);
          setSelectedReferencia(null);
        }}
        onSuccess={async () => {
          setFormOpen(false);
          setSelectedReferencia(null);
          await fetchReferencias();
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Desactivar Referencia"
        message={`¿Desea desactivar la referencia "${referenciaToDelete?.reference}"?`}
        confirmText="Desactivar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </ProtectedLayout>
  );
}
