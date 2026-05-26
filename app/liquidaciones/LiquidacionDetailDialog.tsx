'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
import { liquidacionesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Liquidacion, LiquidacionDetalle } from '@/lib/types';

interface LiquidacionDetailDialogProps {
  open: boolean;
  liquidacion: Liquidacion | null;
  onClose: () => void;
}

function StatCard({ label, value, color, mode }: { label: string; value: string; color: string; mode: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: mode === 'dark' ? '#151828' : '#ffffff',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: color,
          borderRadius: '3px 0 0 3px',
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function LiquidacionDetailDialog({ open, liquidacion, onClose }: LiquidacionDetailDialogProps) {
  const { showError } = useSnackbar();
  const { mode } = useTheme();
  const [details, setDetails] = useState<LiquidacionDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPayment, setTotalPayment] = useState(0);
  const [avgEfficiency, setAvgEfficiency] = useState(0);

  const fetchDetails = useCallback(async () => {
    if (!liquidacion) return;
    try {
      setLoading(true);
      const response = await liquidacionesApi.getById(liquidacion.id);
      const data = response.data;
      setDetails(data);

      const total = data.reduce((sum, d) => sum + d.payment, 0);
      setTotalPayment(total);

      const uniqueDates = new Set(data.map(d => d.workDate));
      let effSum = 0;
      uniqueDates.forEach(date => {
        const dayDetails = data.filter(d => d.workDate === date);
        if (dayDetails.length > 0) effSum += dayDetails[0].efficiency;
      });
      setAvgEfficiency(uniqueDates.size > 0 ? effSum / uniqueDates.size : 0);
    } catch (error) {
      showError(getErrorMessage(error) || 'Error al cargar el detalle de la liquidacion');
    } finally {
      setLoading(false);
    }
  }, [liquidacion, showError]);

  useEffect(() => {
    if (open && liquidacion) fetchDetails();
  }, [open, liquidacion, fetchDetails]);

  const formatMinutes = (minutes: number) => {
    if (minutes === 0) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatMoney = (value: number) => {
    if (value === 0) return '—';
    return '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatEfficiency = (efficiency: number) => {
    if (efficiency === 0) return '—';
    return `${efficiency}%`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'success';
    if (efficiency >= 80) return 'warning';
    return 'error';
  };

  if (!liquidacion) return null;

  const primaryColor = mode === 'dark' ? '#a78bfa' : '#6c5ce7';
  const secondaryColor = mode === 'dark' ? '#22d3ee' : '#00cec9';
  const successColor = mode === 'dark' ? '#34d399' : '#00b894';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          pb: 1.25,
          pt: 1.75,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.85) 0%, rgba(34, 211, 238, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(108, 92, 231, 0.92) 0%, rgba(0, 206, 201, 0.92) 100%)',
          color: mode === 'dark' ? '#0d0f1a' : '#ffffff',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} letterSpacing="-0.02em">
              {liquidacion.module} — Liquidacion de Incentivos
            </Typography>
            <Typography variant="caption" fontWeight={500} sx={{ opacity: 0.8 }}>
              {dayjs.utc(liquidacion.startDate).format('DD/MM/YYYY')} – {dayjs.utc(liquidacion.endDate).format('DD/MM/YYYY')}
            </Typography>
          </Box>
          <Tooltip title={`Creada por ${liquidacion.createdUser}`}>
            <Chip
              label={liquidacion.module}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.7rem', mr: 0.5 }}
            />
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : details.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
              Sin registros
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay datos de incentivos para esta liquidacion
            </Typography>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <StatCard label="Total a pagar" value={formatMoney(totalPayment)} color={successColor} mode={mode} />
              <StatCard
                label="Eficiencia promedio"
                value={avgEfficiency > 0 ? `${avgEfficiency.toFixed(1)}%` : '—'}
                color={primaryColor}
                mode={mode}
              />
              <StatCard label="Registros" value={String(details.length)} color={secondaryColor} mode={mode} />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{
                    '& .MuiTableCell-root': {
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      borderBottom: `2px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
                      py: 1.25,
                    },
                  }}>
                    <TableCell>Empleado</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Trabajado</TableCell>
                    <TableCell align="right">Improductivo</TableCell>
                    <TableCell align="right">Producido</TableCell>
                    <TableCell align="center">Eficiencia</TableCell>
                    <TableCell align="right">Base</TableCell>
                    <TableCell align="right">Pago</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '& .MuiTableCell-root': { py: 1.25 },
                        '&:nth-of-type(even)': {
                          bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)',
                        },
                        '&:hover': {
                          bgcolor: mode === 'dark'
                            ? 'rgba(167, 139, 250, 0.06)'
                            : 'rgba(108, 92, 231, 0.04)',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} fontSize="0.8rem" noWrap sx={{ maxWidth: 140 }}>
                          {row.employeeId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.8rem">
                          {dayjs.utc(row.workDate).format('DD/MM/YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontSize="0.8rem" fontFamily="monospace">
                          {formatMinutes(row.workedMinutes)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontSize="0.8rem" fontFamily="monospace">
                          {formatMinutes(row.downtimeMinutes)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontSize="0.8rem" fontFamily="monospace">
                          {formatMinutes(row.producedMinutes)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {row.efficiency > 0 ? (
                          <Chip
                            label={formatEfficiency(row.efficiency)}
                            color={getEfficiencyColor(row.efficiency) as any}
                            size="small"
                            variant="filled"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', minWidth: 52 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontSize="0.8rem" fontFamily="monospace">
                          {formatMoney(row.incentiveBase)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          fontSize="0.8rem"
                          fontFamily="monospace"
                          color={row.payment > 0 ? 'success.main' : 'text.primary'}
                        >
                          {formatMoney(row.payment)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
