'use client';

import { useCallback, useEffect, useState } from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import ProtectedLayout from '@/components/ProtectedLayout';
import PageHeader from '@/components/PageHeader';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getErrorMessage } from '@/lib/utils';
import { liquidacionesApi } from '@/lib/api';
import { Liquidacion } from '@/lib/types';
import LiquidacionFormDialog from './LiquidacionFormDialog';

export default function LiquidacionesPage() {
  const { showError } = useSnackbar();
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const fetchLiquidaciones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await liquidacionesApi.getAll();
      setLiquidaciones(response.data);
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cargar liquidaciones');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchLiquidaciones();
  }, [fetchLiquidaciones]);

  const columns: GridColDef<Liquidacion>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'module', headerName: 'Módulo', width: 120 },
    {
      field: 'startDate',
      headerName: 'Inicio',
      width: 130,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.startDate ? dayjs(params.row.startDate).format('DD/MM/YYYY') : '-',
    },
    {
      field: 'endDate',
      headerName: 'Fin',
      width: 130,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.endDate ? dayjs(params.row.endDate).format('DD/MM/YYYY') : '-',
    },
    { field: 'createdUser', headerName: 'Creada por', flex: 1, minWidth: 220 },
    {
      field: 'createdAt',
      headerName: 'Fecha creación',
      width: 170,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY HH:mm') : '-',
    },
  ];

  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'PRODUCCION']}>
      <PageHeader
        title="Liquidaciones"
        subtitle="Generación y consulta de liquidaciones por módulo"
        onAddClick={() => setFormOpen(true)}
        addButtonText="Nueva Liquidación"
      />

      <EnhancedDataTable rows={liquidaciones} columns={columns} loading={loading} />

      <LiquidacionFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={async () => {
          setFormOpen(false);
          await fetchLiquidaciones();
        }}
      />
    </ProtectedLayout>
  );
}
