'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface FormDialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  submitText?: string;
  cancelText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  onSubmit: () => void;
  onClose: () => void;
}

export default function FormDialog({
  open,
  title,
  children,
  isLoading = false,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  maxWidth = 'sm',
  onSubmit,
  onClose,
}: FormDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose} 
      maxWidth={maxWidth} 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          color: 'text.primary',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {title}
        <IconButton
          aria-label="cerrar"
          onClick={onClose}
          disabled={isLoading}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
