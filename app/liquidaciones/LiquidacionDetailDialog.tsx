'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
        p: 1.5,
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
      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} sx={{ mt: 0.25 }}>
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

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, LiquidacionDetalle[]>();
    details.forEach(d => {
      const existing = groups.get(d.workDate) || [];
      existing.push(d);
      groups.set(d.workDate, existing);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [details]);

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
      maxWidth="md"
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} letterSpacing="-0.02em" fontSize="0.95rem">
              {liquidacion.module}
            </Typography>
            <Typography variant="caption" fontWeight={500} sx={{ opacity: 0.8, fontSize: '0.72rem' }}>
              {dayjs.utc(liquidacion.startDate).format('DD/MM/YYYY')} – {dayjs.utc(liquidacion.endDate).format('DD/MM/YYYY')} &middot; Creada por {liquidacion.createdUser}
            </Typography>
          </Box>
          <Chip label={liquidacion.module} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : details.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
              Sin registros
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No hay datos de incentivos para esta liquidacion
            </Typography>
          </Box>
        ) : (
          <>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
              <StatCard label="Total a pagar" value={formatMoney(totalPayment)} color={successColor} mode={mode} />
              <StatCard
                label="Eficiencia promedio"
                value={avgEfficiency > 0 ? `${avgEfficiency.toFixed(1)}%` : '—'}
                color={primaryColor}
                mode={mode}
              />
              <StatCard label="Registros" value={String(details.length)} color={secondaryColor} mode={mode} />
            </Stack>

            {groupedByDate.map(([date, rows]) => {
              const dayPayment = rows.reduce((s, r) => s + r.payment, 0);
              const dayEfficiency = rows.length > 0 ? rows[0].efficiency : 0;
              const effColor = getEfficiencyColor(dayEfficiency);
              const labels = ['success', 'warning', 'error'];
              const effIndex = labels.indexOf(effColor);

              return (
                <Box key={date} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 0.75,
                      px: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}
                    >
                      {dayjs.utc(date).format('dddd D [de] MMMM').replace(/^\w/, (c) => c.toUpperCase())}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      &middot; {rows.length} empleado{rows.length !== 1 ? 's' : ''}
                    </Typography>
                    {dayEfficiency > 0 && (
                      <Chip
                        label={`${dayEfficiency}%`}
                        size="small"
                        color={effColor as any}
                        variant="filled"
                        sx={{ fontWeight: 700, fontSize: '0.6rem', height: 20 }}
                      />
                    )}
                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', ml: 'auto', color: successColor }}>
                      {formatMoney(dayPayment)}
                    </Typography>
                  </Box>

                  <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'transparent' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{
                          '& .MuiTableCell-root': {
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            borderBottom: `1.5px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
                            py: 0.75,
                            color: mode === 'dark' ? '#8b90a8' : '#7c8098',
                          },
                        }}>
                          <TableCell sx={{ pl: 1 }}>Empleado</TableCell>
                          <TableCell align="right">Trabajado</TableCell>
                          <TableCell align="right">Improductivo</TableCell>
                          <TableCell align="right">Producido</TableCell>
                          <TableCell align="center">Efic.</TableCell>
                          <TableCell align="right">Base</TableCell>
                          <TableCell align="right">Particip.</TableCell>
                          <TableCell align="right" sx={{ pr: 1 }}>Pago</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => {
                          const dayTotalWorked = rows.reduce((s, r) => s + (r.workedMinutes - r.downtimeMinutes), 0);
                          const participation = dayTotalWorked > 0
                            ? ((row.workedMinutes - row.downtimeMinutes) / dayTotalWorked * 100)
                            : 0;

                          return (
                            <TableRow
                              key={row.id}
                              sx={{
                                '& .MuiTableCell-root': { py: 0.75, px: 0.5 },
                                '&:nth-of-type(even)': {
                                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)',
                                },
                                '&:hover': {
                                  bgcolor: mode === 'dark' ? 'rgba(167, 139, 250, 0.05)' : 'rgba(108, 92, 231, 0.03)',
                                },
                              }}
                            >
                              <TableCell sx={{ pl: '8px !important' }}>
                                <Typography variant="body2" fontWeight={600} fontSize="0.75rem" noWrap sx={{ maxWidth: 120 }}>
                                  #{row.employeeId}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontSize="0.75rem" fontFamily="monospace">
                                  {formatMinutes(row.workedMinutes)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontSize="0.75rem" fontFamily="monospace">
                                  {formatMinutes(row.downtimeMinutes)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontSize="0.75rem" fontFamily="monospace">
                                  {formatMinutes(row.producedMinutes)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {row.efficiency > 0 ? (
                                  <Chip
                                    label={`${row.efficiency}%`}
                                    color={getEfficiencyColor(row.efficiency) as any}
                                    size="small"
                                    variant="filled"
                                    sx={{ fontWeight: 700, fontSize: '0.62rem', height: 20, minWidth: 44 }}
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary" fontSize="0.75rem">—</Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontSize="0.75rem" fontFamily="monospace">
                                  {formatMoney(row.incentiveBase)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontSize="0.72rem" fontFamily="monospace" color="text.secondary">
                                  {participation > 0 ? `${participation.toFixed(0)}%` : '—'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ pr: '8px !important' }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  fontSize="0.75rem"
                                  fontFamily="monospace"
                                  color={row.payment > 0 ? 'success.main' : 'text.primary'}
                                >
                                  {formatMoney(row.payment)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, pt: 0.5 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
