'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridColDef } from '@mui/x-data-grid';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

dayjs.extend(utc);
import ProtectedLayout from '@/components/ProtectedLayout';
import EnhancedDataTable from '@/components/EnhancedDataTable';
import WorkLogCalendar from '@/components/WorkLogCalendar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getErrorMessage } from '@/lib/utils';
import { empleadosApi, workLogsApi } from '@/lib/api';
import { Empleado, WorkLog } from '@/lib/types';
import WorkLogFormDialog from './WorkLogFormDialog';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import { useTheme } from '@/contexts/ThemeContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

dayjs.locale('es');

export default function WorkLogsPage() {
  const { showSuccess, showError } = useSnackbar();
  const { mode } = useTheme();
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedWorkLog, setSelectedWorkLog] = useState<WorkLog | null>(null);
  const [defaultModule, setDefaultModule] = useState<string>('');
  const [defaultDate, setDefaultDate] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workLogToDelete, setWorkLogToDelete] = useState<WorkLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [filterMonth, setFilterMonth] = useState<Dayjs | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wlRes, empRes] = await Promise.all([
        workLogsApi.getAll(),
        empleadosApi.getAll(),
      ]);
      const empMap = new Map(empRes.data.map((e: Empleado) => [e.id, e]));
      setEmpleados(empRes.data);
      setWorkLogs(
        wlRes.data.map((w: WorkLog) => ({
          ...w,
          workDate: dayjs.utc(w.workDate).format('YYYY-MM-DD'),
          employee: empMap.get(w.employeeId),
        }))
      );
    } catch (error) {
      showError(getErrorMessage(error) || 'Error al cargar registros');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getModulesForDate = useCallback(
    (date: string) =>
      Array.from(new Set(workLogs.filter((l) => l.workDate === date).map((l) => l.module))),
    [workLogs]
  );

  const getWorkLogsForDate = useCallback(
    (date: string) => workLogs.filter((l) => l.workDate === date),
    [workLogs]
  );

  const handleViewDay = (date: string) => {
    setSelectedDate(date);
    setDayDialogOpen(true);
  };

  const startDate = dayjs().isBefore(dayjs(`${dayjs().year()}-04-01`))
    ? dayjs(`${dayjs().year() - 1}-04-01`)
    : dayjs(`${dayjs().year()}-04-01`);

  const dateRows = (() => {
    const rows: { id: string; date: string; displayDate: string; hasM1: boolean; hasM2: boolean }[] = [];
    let cursor = startDate.startOf('day');
    const today = dayjs().startOf('day');
    while (cursor.isSame(today) || cursor.isBefore(today)) {
      const date = cursor.format('YYYY-MM-DD');
      const mods = getModulesForDate(date);
      rows.push({
        id: date,
        date,
        displayDate: cursor.format('DD/MM/YYYY'),
        hasM1: mods.includes('M1'),
        hasM2: mods.includes('M2'),
      });
      cursor = cursor.add(1, 'day');
    }
    return rows;
  })();

  const filteredDateRows = filterMonth
    ? dateRows.filter((r) => dayjs(r.date).isSame(filterMonth, 'month'))
    : dateRows;

  const dayLogColumns: GridColDef<WorkLog>[] = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'employee', headerName: 'Empleado', flex: 1, valueGetter: (_v, r) => r.employee?.name || `#${r.employeeId}` },
    { field: 'module', headerName: 'Módulo' },
    { field: 'workDate', headerName: 'Fecha', renderCell: (p) => p.row.workDate ? dayjs(p.row.workDate).format('DD/MM') : '-' },
    { field: 'minutesWorked', headerName: 'Min. trab.', type: 'number' },
    { field: 'minutesDowntime', headerName: 'Min. impr.', type: 'number' },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => { setSelectedWorkLog(p.row); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => { setWorkLogToDelete(p.row); setDeleteDialogOpen(true); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const tableColumns: GridColDef<WorkLog>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'employee', headerName: 'Empleado', flex: 1, valueGetter: (_v, r) => r.employee?.name || `#${r.employeeId}` },
    { field: 'module', headerName: 'Módulo' },
    { field: 'workDate', headerName: 'Fecha', renderCell: (p) => p.row.workDate ? dayjs(p.row.workDate).format('DD/MM/YYYY') : '-' },
    { field: 'minutesWorked', headerName: 'Min. trabajados', type: 'number' },
    { field: 'minutesDowntime', headerName: 'Min. improductivos', type: 'number' },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => { setSelectedWorkLog(p.row); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => { setWorkLogToDelete(p.row); setDeleteDialogOpen(true); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!workLogToDelete) return;
    try {
      setIsDeleting(true);
      await workLogsApi.delete(workLogToDelete.id);
      showSuccess('Registro eliminado');
      await fetchData();
    } catch (error) {
      showError(getErrorMessage(error) || 'Error al eliminar');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setWorkLogToDelete(null);
    }
  };

  return (
    <ProtectedLayout allowedRoles={['ADMIN', 'PRODUCCION']}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Registros Laborados</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de turnos por módulo
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Paper
            sx={{
              display: 'flex',
              p: 0.5,
              borderRadius: 3,
              border: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
              bgcolor: mode === 'dark' ? 'rgba(13, 15, 26, 0.5)' : 'rgba(247, 248, 252, 0.8)',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setViewMode('calendar')}
              sx={{
                background: viewMode === 'calendar' ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'transparent',
                color: viewMode === 'calendar' ? 'white' : 'text.secondary',
                borderRadius: 2,
              }}
            >
              <ViewModuleIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('table')}
              sx={{
                background: viewMode === 'table' ? 'linear-gradient(135deg, #6c5ce7, #a29bfe)' : 'transparent',
                color: viewMode === 'table' ? 'white' : 'text.secondary',
                borderRadius: 2,
              }}
            >
              <ViewAgendaIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Box>
      </Box>

      {viewMode === 'calendar' ? (
        <WorkLogCalendar
          workLogs={workLogs}
          employees={empleados}
          loading={loading}
          onViewDay={handleViewDay}
          onShiftSaved={fetchData}
        />
      ) : (
        <Paper sx={{ p: 3, width: '100%', animation: 'slideUp 0.5s ease' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">Mes:</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Button
                size="small"
                onClick={() => setFilterMonth(filterMonth ? null : dayjs())}
              >
                {filterMonth ? filterMonth.format('MMMM YYYY') : 'Todos'}
              </Button>
            </LocalizationProvider>
            {filterMonth && (
              <Button size="small" onClick={() => setFilterMonth(null)}>Limpiar</Button>
            )}
          </Box>
          <EnhancedDataTable
            rows={filteredDateRows}
            columns={[
              { field: 'date', headerName: 'Fecha', renderCell: (p) => p.row.displayDate },
              { field: 'hasM1', headerName: 'M1', renderCell: (p) => p.value ? 'Registrado' : 'Falta' },
              { field: 'hasM2', headerName: 'M2', renderCell: (p) => p.value ? 'Registrado' : 'Falta' },
              {
                field: 'actions',
                headerName: 'Acciones',
                sortable: false,
                renderCell: (p) => (
                  <Button size="small" variant="outlined" onClick={() => handleViewDay(p.row.date)}>
                    Ver detalles
                  </Button>
                ),
              },
            ]}
            loading={loading}
          />
        </Paper>
      )}

      {/* Day dialog */}
      <Dialog
        open={dayDialogOpen}
        onClose={() => setDayDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '14px', border: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}` },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, pb: 1, borderBottom: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}` }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {dayjs(selectedDate).format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Módulos: {getModulesForDate(selectedDate).join(', ') || 'Sin registros'}
            </Typography>
          </Box>
          <IconButton onClick={() => setDayDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important', pb: 2 }}>
          <EnhancedDataTable
            rows={getWorkLogsForDate(selectedDate)}
            columns={dayLogColumns}
            loading={false}
            compact
            showToolbar={false}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDayDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <WorkLogFormDialog
        open={formOpen}
        workLog={selectedWorkLog}
        empleados={empleados}
        defaultModule={defaultModule}
        defaultDate={defaultDate}
        onClose={() => { setFormOpen(false); setSelectedWorkLog(null); setDefaultModule(''); setDefaultDate(''); }}
        onSuccess={async () => {
          setFormOpen(false);
          setSelectedWorkLog(null);
          setDefaultModule('');
          setDefaultDate('');
          await fetchData();
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Registro"
        message="¿Desea eliminar este registro?"
        confirmText="Eliminar"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </ProtectedLayout>
  );
}
