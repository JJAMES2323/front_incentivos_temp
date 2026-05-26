'use client';

import { useCallback, useEffect, useState } from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
import ProtectedLayout from '@/components/ProtectedLayout';
import PageHeader from '@/components/PageHeader';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getErrorMessage } from '@/lib/utils';
import { liquidacionesApi } from '@/lib/api';
import { Liquidacion } from '@/lib/types';
import LiquidacionFormDialog from './LiquidacionFormDialog';
import LiquidacionDetailDialog from './LiquidacionDetailDialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function LiquidacionesPage() {
  const { showError } = useSnackbar();
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<Liquidacion | null>(null);

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

  const handleViewDetail = (liquidacion: Liquidacion) => {
    setSelectedLiquidacion(liquidacion);
    setDetailOpen(true);
  };

  const columns: GridColDef<Liquidacion>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'module', headerName: 'Modulo', width: 120 },
    {
      field: 'startDate',
      headerName: 'Inicio',
      width: 130,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.startDate ? dayjs.utc(params.row.startDate).format('DD/MM/YYYY') : '-',
    },
    {
      field: 'endDate',
      headerName: 'Fin',
      width: 130,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.endDate ? dayjs.utc(params.row.endDate).format('DD/MM/YYYY') : '-',
    },
    { field: 'createdUser', headerName: 'Creada por', flex: 1, minWidth: 220 },
    {
      field: 'createdAt',
      headerName: 'Fecha creacion',
      width: 170,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Liquidacion>) => (
        <Tooltip title="Ver detalle">
          <IconButton
            size="small"
            onClick={() => handleViewDetail(params.row)}
            color="primary"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'PRODUCCION']}>
      <PageHeader
        title="Liquidaciones"
        subtitle="Generacion y consulta de liquidaciones por modulo"
        onAddClick={() => setFormOpen(true)}
        addButtonText="Nueva Liquidacion"
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

      <LiquidacionDetailDialog
        open={detailOpen}
        liquidacion={selectedLiquidacion}
        onClose={() => setDetailOpen(false)}
      />
    </ProtectedLayout>
  );
}
