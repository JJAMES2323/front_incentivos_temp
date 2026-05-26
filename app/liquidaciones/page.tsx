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
import Chip from '@mui/material/Chip';
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
    {
      field: 'module',
      headerName: 'Modulo',
      width: 80,
      renderCell: (params: GridRenderCellParams<Liquidacion>) => (
        <Chip
          label={params.row.module}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: params.row.module === 'M1'
              ? 'rgba(108, 92, 231, 0.12)'
              : 'rgba(0, 206, 201, 0.12)',
            color: params.row.module === 'M1' ? '#6c5ce7' : '#00cec9',
            border: 'none',
            borderRadius: '6px',
          }}
        />
      ),
    },
    {
      field: 'startDate',
      headerName: 'Inicio',
      width: 80,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.startDate ? dayjs.utc(params.row.startDate).format('DD/MM') : '-',
    },
    {
      field: 'endDate',
      headerName: 'Fin',
      width: 80,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.endDate ? dayjs.utc(params.row.endDate).format('DD/MM') : '-',
    },
    {
      field: 'createdAt',
      headerName: 'Creada',
      width: 90,
      renderCell: (params: GridRenderCellParams<Liquidacion>) =>
        params.row.createdAt ? dayjs(params.row.createdAt).format('DD/MM HH:mm') : '-',
    },
    {
      field: 'actions',
      headerName: '',
      width: 56,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Liquidacion>) => (
        <Tooltip title={`Ver detalle — Creada por ${params.row.createdUser}`}>
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
