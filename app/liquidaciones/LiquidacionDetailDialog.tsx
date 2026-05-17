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
import dayjs from 'dayjs';
import { liquidacionesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { Liquidacion, LiquidacionDetalle } from '@/lib/types';

interface LiquidacionDetailDialogProps {
  open: boolean;
  liquidacion: Liquidacion | null;
  onClose: () => void;
}

export default function LiquidacionDetailDialog({ open, liquidacion, onClose }: LiquidacionDetailDialogProps) {
  const { showError } = useSnackbar();
  const [details, setDetails] = useState<LiquidacionDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPayment, setTotalPayment] = useState(0);
  const [avgEfficiency, setAvgEfficiency] = useState(0);

  const fetchDetails = useCallback(async () => {
    if (!liquidacion) return;
    try {
      setLoading(true);
      const response = await liquidacionesApi.getById(liquidacion.id);
      setDetails(response.data);

      const total = response.data.reduce((sum, d) => sum + d.payment, 0);
      setTotalPayment(total);

      const uniqueDates = new Set(response.data.map(d => d.workDate));
      let effSum = 0;
      uniqueDates.forEach(date => {
        const dayDetails = response.data.filter(d => d.workDate === date);
        if (dayDetails.length > 0) {
          effSum += dayDetails[0].efficiency;
        }
      });
      setAvgEfficiency(uniqueDates.size > 0 ? effSum / uniqueDates.size : 0);
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al cargar el detalle de la liquidacion');
    } finally {
      setLoading(false);
    }
  }, [liquidacion, showError]);

  useEffect(() => {
    if (open && liquidacion) {
      fetchDetails();
    }
  }, [open, liquidacion, fetchDetails]);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'success';
    if (efficiency >= 80) return 'warning';
    return 'error';
  };

  if (!liquidacion) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Detalle de Liquidacion - {liquidacion.module}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          {dayjs(liquidacion.startDate).format('DD/MM/YYYY')} - {dayjs(liquidacion.endDate).format('DD/MM/YYYY')}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : details.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              No hay registros para esta liquidacion
            </Typography>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Paper
                sx={{
                  flex: 1,
                  p: 2,
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Total a Pagar
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, color: 'primary.main' }}>
                  ${totalPayment.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Paper>
              <Paper
                sx={{
                  flex: 1,
                  p: 2,
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Eficiencia Promedio
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                  <Chip
                    label={`${avgEfficiency.toFixed(1)}%`}
                    color={getEfficiencyColor(avgEfficiency) as any}
                    size="small"
                    sx={{ fontSize: '1rem', fontWeight: 700, mt: 0.5 }}
                  />
                </Typography>
              </Paper>
              <Paper
                sx={{
                  flex: 1,
                  p: 2,
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                  Registros
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, color: 'text.primary' }}>
                  {details.length}
                </Typography>
              </Paper>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: 'rgba(124, 58, 237, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Empleado</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Min. Trabajados</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Min. No Productivos</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Min. Producidos</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Eficiencia</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Base Incentivo</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Pago</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:hover': {
                          background: 'rgba(124, 58, 237, 0.04)',
                        },
                      }}
                    >
                      <TableCell>{row.employeeId}</TableCell>
                      <TableCell>{dayjs(row.workDate).format('DD/MM/YYYY')}</TableCell>
                      <TableCell align="right">{formatMinutes(row.workedMinutes)}</TableCell>
                      <TableCell align="right">{formatMinutes(row.downtimeMinutes)}</TableCell>
                      <TableCell align="right">{formatMinutes(row.producedMinutes)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${row.efficiency}%`}
                          color={getEfficiencyColor(row.efficiency) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${row.incentiveBase.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ${row.payment.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
