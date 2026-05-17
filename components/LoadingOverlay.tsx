'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Cargando...' }: LoadingOverlayProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
