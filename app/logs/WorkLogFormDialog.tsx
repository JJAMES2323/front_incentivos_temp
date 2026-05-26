'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import FormDialog from '@/components/FormDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { workLogsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { Empleado, WorkLog } from '@/lib/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface WorkLogFormDialogProps {
  open: boolean;
  workLog: WorkLog | null;
  empleados: Empleado[];
  defaultModule?: string;
  defaultDate?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WorkLogFormDialog({
  open,
  workLog,
  empleados,
  defaultModule,
  defaultDate,
  onClose,
  onSuccess,
}: WorkLogFormDialogProps) {
  const { showSuccess, showError } = useSnackbar();
  const isEditing = Boolean(workLog);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: 0,
    module: defaultModule || '',
    workDate: defaultDate || dayjs().format('YYYY-MM-DD'),
    minutesWorked: 480,
    minutesDowntime: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredEmployees = useMemo(
    () => empleados.filter((employee) => !formData.module || employee.module === formData.module),
    [empleados, formData.module]
  );

  useEffect(() => {
    if (!open) return;

    if (workLog) {
      setFormData({
        employeeId: workLog.employeeId,
        module: workLog.module,
        workDate: dayjs.utc(workLog.workDate).format('YYYY-MM-DD'),
        minutesWorked: workLog.minutesWorked,
        minutesDowntime: workLog.minutesDowntime,
      });
    } else {
      setFormData({
        employeeId: 0,
        module: defaultModule || '',
        workDate: defaultDate || dayjs().format('YYYY-MM-DD'),
        minutesWorked: 480,
        minutesDowntime: '',
      });
    }

    setErrors({});
  }, [open, workLog, defaultModule, defaultDate]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.module.trim()) nextErrors.module = 'Seleccione un módulo';
    if (!formData.employeeId) nextErrors.employeeId = 'Seleccione un empleado';
    if (!formData.workDate) nextErrors.workDate = 'La fecha es requerida';
    if (formData.minutesWorked <= 0) nextErrors.minutesWorked = 'Debe ser mayor que 0';
    const downtime = Number(formData.minutesDowntime);
    if (isNaN(downtime) || downtime < 0) nextErrors.minutesDowntime = 'Debe ser 0 o mayor';
    if (downtime > formData.minutesWorked) {
      nextErrors.minutesDowntime = 'No puede superar los minutos trabajados';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleEmployeeChange = (employeeId: number) => {
    const employee = empleados.find((item) => item.id === employeeId);
    setFormData((current) => ({
      ...current,
      employeeId,
      module: employee?.module || current.module,
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);

      if (isEditing && workLog) {
        await workLogsApi.update(workLog.id, {
          minutesWorked: formData.minutesWorked,
          minutesDowntime: Number(formData.minutesDowntime || 0),
        });
        showSuccess('Registro laborado actualizado correctamente');
      } else {
        await workLogsApi.create({
          ...formData,
          minutesDowntime: Number(formData.minutesDowntime || 0),
        });
        showSuccess('Registro laborado creado correctamente');
      }

      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      showError(message || (isEditing ? 'Error al actualizar registro laborado' : 'Error al crear registro laborado'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      title={isEditing ? 'Editar Registro Laborado' : `Agregar Turno - ${defaultModule || 'Módulo'}`}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <FormControl fullWidth error={!!errors.module} required>
          <InputLabel>Módulo</InputLabel>
          <Select
            value={formData.module}
            label="Módulo"
            disabled={isEditing || !!defaultModule}
            onChange={(e) => setFormData({ ...formData, module: e.target.value, employeeId: 0 })}
          >
            {['M1', 'M2'].map((module) => (
              <MenuItem key={module} value={module}>
                {module}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth error={!!errors.employeeId} required>
          <InputLabel>Empleado</InputLabel>
          <Select
            value={formData.employeeId || ''}
            label="Empleado"
            disabled={isEditing}
            onChange={(e) => handleEmployeeChange(Number(e.target.value))}
          >
            {filteredEmployees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Fecha"
          type="date"
          value={formData.workDate}
          onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
          error={!!errors.workDate}
          helperText={errors.workDate}
          disabled={isEditing || !!defaultDate}
          fullWidth
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Minutos trabajados"
          type="number"
          value={formData.minutesWorked}
          onChange={(e) => setFormData({ ...formData, minutesWorked: Number(e.target.value) })}
          error={!!errors.minutesWorked}
          helperText={errors.minutesWorked}
          fullWidth
          required
        />
        <TextField
          label="Minutos improductivos"
          type="number"
          value={formData.minutesDowntime}
           onChange={(e) => setFormData({ ...formData, minutesDowntime: e.target.value })}
          error={!!errors.minutesDowntime}
          helperText={errors.minutesDowntime}
          fullWidth
          required
        />
      </Box>
    </FormDialog>
  );
}
