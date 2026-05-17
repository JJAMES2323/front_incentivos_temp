'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {icon || <InboxIcon sx={{ fontSize: 40, color: 'text.secondary' }} />}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 2 }}>
          {description}
        </Typography>
      )}
      {actionText && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}
