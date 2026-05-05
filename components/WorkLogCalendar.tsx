'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { useTheme } from '@/contexts/ThemeContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { WorkLog, Empleado } from '@/lib/types';
import { workLogsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

dayjs.locale('es');

interface ShiftEntryDialogProps {
  open: boolean;
  date: string;
  module: string;
  employees: Empleado[];
  onClose: () => void;
  onSuccess: () => void;
}

function ShiftEntryDialog({ open, date, module, employees, onClose, onSuccess }: ShiftEntryDialogProps) {
  const { mode } = useTheme();
  const { showSuccess, showError } = useSnackbar();
  const [baseMinutes, setBaseMinutes] = useState(480);
  const [employeeData, setEmployeeData] = useState<{ id: number; downtime: number }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const moduleEmployees = useMemo(
    () => employees.filter((emp) => emp.active && emp.module === module),
    [employees, module]
  );

  useEffect(() => {
    if (open && moduleEmployees.length > 0) {
      setEmployeeData(
        moduleEmployees.map((emp) => ({ id: emp.id, downtime: 0 }))
      );
      setBaseMinutes(480);
    }
  }, [open, moduleEmployees]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await Promise.all(
        employeeData.map((emp) =>
          workLogsApi.create({
            employeeId: emp.id,
            module,
            workDate: date,
            minutesWorked: baseMinutes,
            minutesDowntime: emp.downtime,
          })
        )
      );
      showSuccess(`Turno ${module} agregado correctamente`);
      onSuccess();
      onClose();
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message || 'Error al agregar turno');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open || moduleEmployees.length === 0) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 700,
          pb: 1,
          borderBottom: mode === 'dark'
            ? '1px solid rgba(71, 85, 105, 0.3)'
            : '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: module === 'M1' ? '#6366f1' : '#ec4899',
            }}
          >
            {module}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayjs(date).format('DD/MM/YYYY')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: '24px !important' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Minutos base trabajados
          </Typography>
          <TextField
            type="number"
            value={baseMinutes}
            onChange={(e) => setBaseMinutes(Number(e.target.value))}
            fullWidth
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflow: 'auto' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
            Min. improductivos por empleado
          </Typography>
          {employeeData.map((emp, index) => {
            const employee = moduleEmployees.find((e) => e.id === emp.id);
            return (
              <Box
                key={emp.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: mode === 'dark'
                    ? '1px solid rgba(71, 85, 105, 0.3)'
                    : '1px solid rgba(226, 232, 240, 0.6)',
                  bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.5)',
                }}
              >
                <PersonIcon sx={{ fontSize: 18, color: mode === 'dark' ? '#818cf8' : '#6366f1', flexShrink: 0 }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', flex: 1 }} noWrap>
                  {employee?.name}
                </Typography>
                <TextField
                  label="Impr."
                  type="number"
                  value={emp.downtime}
                  onChange={(e) => {
                    const newData = [...employeeData];
                    newData[index].downtime = Number(e.target.value);
                    setEmployeeData(newData);
                  }}
                  size="small"
                  sx={{ width: 100 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 55 }}>
                  {baseMinutes}m
                </Typography>
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface CalendarDayProps {
  day: dayjs.Dayjs;
  isCurrentMonth: boolean;
  isToday: boolean;
  modules: string[];
  logs: WorkLog[];
  onAddModule: (date: string, module: string) => void;
  onViewDay: (date: string) => void;
}

function CalendarDay({ day, isCurrentMonth, isToday, modules, logs, onAddModule, onViewDay }: CalendarDayProps) {
  const { mode } = useTheme();
  const hasM1 = modules.includes('M1');
  const hasM2 = modules.includes('M2');

  const getEmployeeCountForModule = (mod: string) =>
    logs.filter((log) => log.module === mod).length;

  if (!isCurrentMonth) {
    return (
      <Box
        sx={{
          minHeight: { xs: 80, sm: 100, md: 110 },
          border: mode === 'dark'
            ? '1px solid rgba(71, 85, 105, 0.15)'
            : '1px solid rgba(226, 232, 240, 0.3)',
          p: 1,
          bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.2)' : 'rgba(248, 250, 252, 0.3)',
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: { xs: 80, sm: 100, md: 110 },
        border: mode === 'dark'
          ? '1px solid rgba(71, 85, 105, 0.3)'
          : '1px solid rgba(226, 232, 240, 0.6)',
        p: 1,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        bgcolor: isToday
          ? mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.03)'
          : 'transparent',
        '&:hover': {
          bgcolor: mode === 'dark' ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.02)',
          '& .day-add-btn': { opacity: 1 },
        },
      }}
      onClick={() => onViewDay(day.format('YYYY-MM-DD'))}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isToday ? 700 : 500,
            fontSize: '0.8rem',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: isToday ? 'white' : 'text.primary',
            background: isToday
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'transparent',
          }}
        >
          {day.format('D')}
        </Typography>

        {logs.length > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
            {logs.length} reg.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* M1 */}
        {hasM1 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.75,
              py: 0.3,
              borderRadius: 1.5,
              bgcolor: mode === 'dark'
                ? 'rgba(99, 102, 241, 0.12)'
                : 'rgba(99, 102, 241, 0.08)',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 12, color: '#6366f1', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.65rem', color: '#6366f1' }}>
              M1
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
              ({getEmployeeCountForModule('M1')})
            </Typography>
          </Box>
        ) : (
          <IconButton
            className="day-add-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddModule(day.format('YYYY-MM-DD'), 'M1');
            }}
            sx={{
              opacity: 0,
              transition: 'all 0.2s ease',
              width: '100%',
              borderRadius: 1.5,
              bgcolor: mode === 'dark'
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(99, 102, 241, 0.06)',
              border: mode === 'dark'
                ? '1px dashed rgba(99, 102, 241, 0.3)'
                : '1px dashed rgba(99, 102, 241, 0.2)',
              '&:hover': {
                bgcolor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.2)'
                  : 'rgba(99, 102, 241, 0.12)',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 14, color: '#6366f1' }} />
          </IconButton>
        )}

        {/* M2 */}
        {hasM2 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.75,
              py: 0.3,
              borderRadius: 1.5,
              bgcolor: mode === 'dark'
                ? 'rgba(236, 72, 153, 0.12)'
                : 'rgba(236, 72, 153, 0.08)',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 12, color: '#ec4899', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.65rem', color: '#ec4899' }}>
              M2
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
              ({getEmployeeCountForModule('M2')})
            </Typography>
          </Box>
        ) : (
          <IconButton
            className="day-add-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddModule(day.format('YYYY-MM-DD'), 'M2');
            }}
            sx={{
              opacity: 0,
              transition: 'all 0.2s ease',
              width: '100%',
              borderRadius: 1.5,
              bgcolor: mode === 'dark'
                ? 'rgba(236, 72, 153, 0.1)'
                : 'rgba(236, 72, 153, 0.06)',
              border: mode === 'dark'
                ? '1px dashed rgba(236, 72, 153, 0.3)'
                : '1px dashed rgba(236, 72, 153, 0.2)',
              '&:hover': {
                bgcolor: mode === 'dark'
                  ? 'rgba(236, 72, 153, 0.2)'
                  : 'rgba(236, 72, 153, 0.12)',
              },
            }}
          >
            <AddIcon sx={{ fontSize: 14, color: '#ec4899' }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}

interface WorkLogCalendarProps {
  workLogs: WorkLog[];
  employees: Empleado[];
  loading?: boolean;
  onViewDay: (date: string) => void;
  onShiftSaved: () => void;
}

export default function WorkLogCalendar({ workLogs, employees, loading, onViewDay, onShiftSaved }: WorkLogCalendarProps) {
  const { mode } = useTheme();
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
  const [shiftDialog, setShiftDialog] = useState<{ open: boolean; date: string; module: string }>({
    open: false,
    date: '',
    module: '',
  });

  const getModulesForDate = useCallback((date: string) => {
    const logsForDate = workLogs.filter((log) => log.workDate === date);
    return Array.from(new Set(logsForDate.map((log) => log.module)));
  }, [workLogs]);

  const getWorkLogsForDate = useCallback((date: string) => {
    return workLogs.filter((log) => log.workDate === date);
  }, [workLogs]);

  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const startOfCalendar = startOfMonth.startOf('week');
    const endOfMonth = currentMonth.endOf('month');
    const endOfCalendar = endOfMonth.endOf('week');

    const days: dayjs.Dayjs[] = [];
    let cursor = startOfCalendar;

    while (cursor.isBefore(endOfCalendar) || cursor.isSame(endOfCalendar, 'day')) {
      days.push(cursor);
      cursor = cursor.add(1, 'day');
    }

    return days;
  }, [currentMonth]);

  const weeks = useMemo(() => {
    const result: dayjs.Dayjs[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const stats = useMemo(() => {
    const daysInMonth = currentMonth.daysInMonth();
    const startOfMonth = currentMonth.startOf('month');
    let daysWithM1 = 0;
    let daysWithM2 = 0;
    let totalDays = 0;

    for (let i = 0; i < daysInMonth; i++) {
      const day = startOfMonth.add(i, 'day');
      const date = day.format('YYYY-MM-DD');
      const modules = getModulesForDate(date);
      if (modules.includes('M1')) daysWithM1++;
      if (modules.includes('M2')) daysWithM2++;
      totalDays++;
    }

    return { daysWithM1, daysWithM2, totalDays };
  }, [currentMonth, getModulesForDate]);

  const handleAddModule = (date: string, module: string) => {
    setShiftDialog({ open: true, date, module });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', minHeight: 400 }}>
        <Typography color="text.secondary">Cargando calendario...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          width: '100%',
          animation: 'slideUp 0.5s ease',
          borderRadius: 4,
          overflow: 'hidden',
          border: mode === 'dark'
            ? '1px solid rgba(71, 85, 105, 0.4)'
            : '1px solid rgba(226, 232, 240, 0.6)',
          boxShadow: mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.2)'
            : '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: mode === 'dark'
              ? '1px solid rgba(71, 85, 105, 0.4)'
              : '1px solid rgba(226, 232, 240, 0.6)',
            background: mode === 'dark'
              ? 'linear-gradient(to right, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
              : 'linear-gradient(to right, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => setCurrentMonth(dayjs())}
              size="small"
              sx={{
                bgcolor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(99, 102, 241, 0.1)',
              }}
            >
              <TodayIcon sx={{ fontSize: 20, color: '#6366f1' }} />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
              {currentMonth.format('MMMM YYYY')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => setCurrentMonth((p) => p.subtract(1, 'month'))} size="small">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={() => setCurrentMonth((p) => p.add(1, 'month'))} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1,
            borderBottom: mode === 'dark'
              ? '1px solid rgba(71, 85, 105, 0.3)'
              : '1px solid rgba(226, 232, 240, 0.6)',
            bgcolor: mode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.5)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#6366f1' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              M1: {stats.daysWithM1}/{stats.totalDays}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: '#ec4899' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              M2: {stats.daysWithM2}/{stats.totalDays}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            + en cada módulo pendiente
          </Typography>
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* Week headers */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: mode === 'dark'
                ? '2px solid rgba(71, 85, 105, 0.5)'
                : '2px solid rgba(226, 232, 240, 1)',
            }}
          >
            {weekDays.map((d) => (
              <Box
                key={d}
                sx={{
                  p: 1.5,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: mode === 'dark' ? '#94a3b8' : '#64748b',
                }}
              >
                {d}
              </Box>
            ))}
          </Box>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <Box
              key={wi}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                flex: 1,
              }}
            >
              {week.map((day) => {
                const date = day.format('YYYY-MM-DD');
                const isCurrentMonth = day.month() === currentMonth.month();
                const isToday = day.isSame(dayjs(), 'day');
                const modules = getModulesForDate(date);
                const logs = getWorkLogsForDate(date);

                return (
                  <CalendarDay
                    key={date}
                    day={day}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    modules={modules}
                    logs={logs}
                    onAddModule={handleAddModule}
                    onViewDay={onViewDay}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      <ShiftEntryDialog
        open={shiftDialog.open}
        date={shiftDialog.date}
        module={shiftDialog.module}
        employees={employees}
        onClose={() => setShiftDialog({ open: false, date: '', module: '' })}
        onSuccess={onShiftSaved}
      />
    </>
  );
}
