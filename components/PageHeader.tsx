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
        animation: 'fadeIn 0.4s ease',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          pl: 3,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 4,
            height: '80%',
            borderRadius: 2,
            background: 'linear-gradient(180deg, #6366f1, #ec4899)',
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, fontWeight: 500 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action ||
        (showAddButton && onAddClick && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradient 3s ease infinite',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {addButtonText}
          </Button>
        ))}
    </Box>
  );
}
