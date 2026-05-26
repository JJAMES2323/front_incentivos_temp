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
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
import { liquidacionesApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Liquidacion, LiquidacionDetalle } from '@/lib/types';

interface Props {
  open: boolean;
  liquidacion: Liquidacion | null;
  onClose: () => void;
}

export default function LiquidacionDetailDialog({ open, liquidacion, onClose }: Props) {
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
      setTotalPayment(data.reduce((sum, d) => sum + d.payment, 0));

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

  const fmtMin = (m: number) => {
    if (!m) return '—';
    const h = Math.floor(m / 60), mins = m % 60;
    return mins ? `${h}h ${mins}m` : `${h}h`;
  };

  const fmt$ = (v: number) =>
    v ? '$' + v.toLocaleString('es-CO') : '—';

  const effColor = (e: number) =>
    e >= 100 ? 'success' as const : e >= 80 ? 'warning' as const : 'error' as const;

  if (!liquidacion) return null;

  const isDark = mode === 'dark';
  const prim = isDark ? '#a78bfa' : '#6c5ce7';
  const sec = isDark ? '#22d3ee' : '#00cec9';
  const succ = isDark ? '#34d399' : '#00b894';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={800} fontSize="1.05rem" letterSpacing="-0.02em">
              {liquidacion.module} — Liquidacion de Incentivos
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem" sx={{ mt: 0.25, display: 'block' }}>
              {dayjs.utc(liquidacion.startDate).format('DD/MM/YYYY')} – {dayjs.utc(liquidacion.endDate).format('DD/MM/YYYY')}
              &nbsp;&middot;&nbsp;Creada por {liquidacion.createdUser}
            </Typography>
          </Box>
          <Chip label={liquidacion.module} size="small"
            sx={{
              fontWeight: 700, fontSize: '0.7rem',
              bgcolor: liquidacion.module === 'M1'
                ? (isDark ? 'rgba(167,139,250,0.15)' : 'rgba(108,92,231,0.1)')
                : (isDark ? 'rgba(34,211,238,0.15)' : 'rgba(0,206,201,0.1)'),
              color: liquidacion.module === 'M1' ? prim : sec,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, pb: 2.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : details.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>Sin registros</Typography>
            <Typography variant="body2">No hay datos de incentivos para esta liquidacion</Typography>
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: isDark ? 'rgba(21,24,40,0.5)' : 'rgba(247,248,252,0.6)' }}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                    Total pagado
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 0.25, color: succ }}>{fmt$(totalPayment)}</Typography>
                </Box>
                <Box sx={{ width: '1px', bgcolor: 'divider', alignSelf: 'stretch' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                    Eficiencia promedio
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 0.25 }}>
                    {avgEfficiency > 0 ? (
                      <Chip label={`${avgEfficiency.toFixed(1)}%`} size="small"
                        color={effColor(avgEfficiency)} sx={{ fontWeight: 700, fontSize: '0.85rem', px: 0.5 }}
                      />
                    ) : '—'}
                  </Typography>
                </Box>
                <Box sx={{ width: '1px', bgcolor: 'divider', alignSelf: 'stretch' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" fontSize="0.65rem">
                    Registros
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 0.25 }}>{details.length}</Typography>
                </Box>
              </Box>
            </Paper>

            {groupedByDate.map(([date, rows]) => {
              const dayPay = rows.reduce((s, r) => s + r.payment, 0);
              const dayEff = rows[0]?.efficiency || 0;
              return (
                <Box key={date} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75, px: 0.5,
                  }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary"
                      sx={{ fontSize: '0.7rem', letterSpacing: '0.03em', textTransform: 'uppercase' }}
                    >
                      {dayjs.utc(date).format('dddd D [de] MMMM').replace(/^\w/, c => c.toUpperCase())}
                    </Typography>
                    <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? '#262a40' : '#e4e6ef' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                      {fmt$(dayPay)}
                    </Typography>
                    {dayEff > 0 && (
                      <Chip label={`${dayEff}%`} size="small" color={effColor(dayEff)}
                        variant="filled" sx={{ fontWeight: 700, fontSize: '0.58rem', height: 18 }} />
                    )}
                  </Box>

                  <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'transparent' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{
                          '& .MuiTableCell-root': {
                            fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.04em',
                            textTransform: 'uppercase', py: 0.75, color: 'text.secondary',
                            borderBottom: `1.5px solid ${isDark ? '#262a40' : '#e4e6ef'}`,
                          },
                        }}>
                          <TableCell sx={{ pl: 1.25 }}>Empleado</TableCell>
                          <TableCell align="right">Trabajado</TableCell>
                          <TableCell align="right">Improductivo</TableCell>
                          <TableCell align="right">Producido</TableCell>
                          <TableCell align="center">Efic.</TableCell>
                          <TableCell align="right">Base</TableCell>
                          <TableCell align="right">Part.</TableCell>
                          <TableCell align="right" sx={{ pr: 1.25 }}>Pago</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map(row => {
                          const eff = row.workedMinutes - row.downtimeMinutes;
                          const totalEff = rows.reduce((s, r) => s + (r.workedMinutes - r.downtimeMinutes), 0);
                          const part = totalEff > 0 ? (eff / totalEff) * 100 : 0;

                          return (
                            <TableRow key={row.id} sx={{
                              '& .MuiTableCell-root': { py: 0.75, px: 0.5, fontSize: '0.75rem' },
                              '&:nth-of-type(even)': { bgcolor: isDark ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.008)' },
                              '&:hover': { bgcolor: isDark ? 'rgba(167,139,250,0.04)' : 'rgba(108,92,231,0.02)' },
                            }}>
                              <TableCell sx={{ pl: '10px !important', fontWeight: 600 }}>
                                #{row.employeeId}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                {fmtMin(row.workedMinutes)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                {fmtMin(row.downtimeMinutes)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                {fmtMin(row.producedMinutes)}
                              </TableCell>
                              <TableCell align="center">
                                {row.efficiency > 0 ? (
                                  <Chip label={`${row.efficiency}%`} size="small"
                                    color={effColor(row.efficiency)} variant="filled"
                                    sx={{ fontWeight: 700, fontSize: '0.6rem', height: 19, minWidth: 40 }}
                                  />
                                ) : '—'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                                {fmt$(row.incentiveBase)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'text.secondary' }}>
                                {part > 0 ? `${part.toFixed(0)}%` : '—'}
                              </TableCell>
                              <TableCell align="right" sx={{ pr: '10px !important', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.72rem', color: row.payment > 0 ? (isDark ? '#34d399' : '#00b894') : 'text.primary' }}>
                                {fmt$(row.payment)}
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

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, fontSize: '0.8rem' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
