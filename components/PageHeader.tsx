'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@/contexts/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAddClick?: () => void;
  addButtonText?: string;
  showAddButton?: boolean;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  onAddClick,
  addButtonText = 'Agregar',
  showAddButton = true,
  action,
}: PageHeaderProps) {
  const { mode } = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        animation: 'fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.35rem', md: '1.55rem' },
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            color: mode === 'dark' ? '#e8eaf0' : '#1a1d2e',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              fontWeight: 400,
              color: mode === 'dark' ? '#8b90a8' : '#7c8098',
              fontSize: '0.85rem',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action ||
        (showAddButton && onAddClick && (
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '1.1rem !important' }} />}
            onClick={onAddClick}
            sx={{
              background: 'linear-gradient(135deg, var(--primary-gradient-from) 0%, var(--primary-gradient-to) 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient 4s ease infinite',
              boxShadow: '0 4px 14px rgba(108, 92, 231, 0.25)',
              px: 2.5,
              py: 1,
              fontSize: '0.85rem',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(108, 92, 231, 0.35)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {addButtonText}
          </Button>
        ))}
    </Box>
  );
}
