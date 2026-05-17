'use client';

import { createTheme } from '@mui/material/styles';

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 10,
        fontWeight: 600,
        padding: '10px 24px',
        fontSize: '0.875rem',
        letterSpacing: '0.01em',
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: 'none',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 16px rgba(108, 92, 231, 0.2)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))',
        '&:hover': {
          background: 'linear-gradient(135deg, var(--primary-gradient-from), var(--primary-gradient-to))',
          filter: 'brightness(1.08)',
        },
      },
      containedSecondary: {
        background: 'linear-gradient(135deg, var(--secondary-gradient-from), var(--secondary-gradient-to))',
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '1.5px',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        border: '1px solid',
        borderColor: 'inherit',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'small',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          fontSize: '0.875rem',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          },
          '&.Mui-focused': {
            boxShadow: '0 2px 12px rgba(108, 92, 231, 0.12)',
          },
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.875rem',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        fontWeight: 700,
        fontSize: '0.75rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
        fontSize: '0.75rem',
        letterSpacing: '0.02em',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontWeight: 700,
        fontSize: '1.15rem',
        letterSpacing: '-0.02em',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 18,
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        '&:hover': {
          transform: 'scale(1.08)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '6px 12px',
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6c5ce7',
      light: '#a29bfe',
      dark: '#5a4bd1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00cec9',
      light: '#55efc4',
      dark: '#00b5b0',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e74c5e',
      light: '#ff7685',
      dark: '#c73e50',
    },
    warning: {
      main: '#fdcb6e',
      light: '#ffeaa7',
      dark: '#f0b44a',
    },
    success: {
      main: '#00b894',
      light: '#55efc4',
      dark: '#009874',
    },
    info: {
      main: '#74b9ff',
      light: '#a4d4ff',
      dark: '#4a9eff',
    },
    background: {
      default: '#f7f8fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1d2e',
      secondary: '#7c8098',
    },
    divider: '#e4e6ef',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 },
    h2: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h3: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
    h5: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.35 },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
    subtitle1: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body1: { fontWeight: 400, lineHeight: 1.65 },
    body2: { fontWeight: 400, lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
    caption: { fontWeight: 500, letterSpacing: '0.02em' },
    overline: { fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.65rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    ...sharedComponents,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(ellipse at 15% 30%, rgba(108, 92, 231, 0.04) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 85% 70%, rgba(0, 206, 201, 0.03) 0%, transparent 50%)',
          backgroundAttachment: 'fixed',
        },
        ':root': {
          '--primary-gradient-from': '#6c5ce7',
          '--primary-gradient-to': '#a29bfe',
          '--secondary-gradient-from': '#00cec9',
          '--secondary-gradient-to': '#55efc4',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '--DataGrid-rowBorderColor': '#f0f1f5',
          fontSize: '0.875rem',
        },
        cell: {
          borderBottom: '1px solid #f0f1f5',
          padding: '0 16px',
        },
        columnHeader: {
          background: 'linear-gradient(to bottom, #f7f8fc, #f0f1f5)',
          borderBottom: '1.5px solid #e4e6ef',
          padding: '0 16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(24px) saturate(200%)',
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          borderBottom: '1px solid rgba(228, 230, 239, 0.8)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a78bfa',
      light: '#c4b5fd',
      dark: '#8b5cf6',
      contrastText: '#0d0f1a',
    },
    secondary: {
      main: '#22d3ee',
      light: '#67e8f9',
      dark: '#06b6d4',
      contrastText: '#0d0f1a',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#ef4444',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#10b981',
    },
    info: {
      main: '#60a5fa',
      light: '#93bbfd',
      dark: '#3b82f6',
    },
    background: {
      default: '#0d0f1a',
      paper: '#151828',
    },
    text: {
      primary: '#e8eaf0',
      secondary: '#8b90a8',
    },
    divider: '#262a40',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 },
    h2: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h3: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3 },
    h5: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.35 },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
    subtitle1: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
    body1: { fontWeight: 400, lineHeight: 1.65 },
    body2: { fontWeight: 400, lineHeight: 1.6 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
    caption: { fontWeight: 500, letterSpacing: '0.02em' },
    overline: { fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.65rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    ...sharedComponents,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(ellipse at 15% 30%, rgba(108, 92, 231, 0.08) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 85% 70%, rgba(0, 206, 201, 0.05) 0%, transparent 50%)',
          backgroundAttachment: 'fixed',
        },
        ':root': {
          '--primary-gradient-from': '#a78bfa',
          '--primary-gradient-to': '#c4b5fd',
          '--secondary-gradient-from': '#22d3ee',
          '--secondary-gradient-to': '#67e8f9',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '--DataGrid-rowBorderColor': '#1e2235',
          fontSize: '0.875rem',
        },
        cell: {
          borderBottom: '1px solid #1e2235',
          padding: '0 16px',
        },
        columnHeader: {
          background: 'linear-gradient(to bottom, #151828, #0d0f1a)',
          borderBottom: '1.5px solid #262a40',
          padding: '0 16px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(24px) saturate(200%)',
          backgroundColor: 'rgba(13, 15, 26, 0.78)',
          borderBottom: '1px solid rgba(38, 42, 64, 0.8)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
        },
      },
    },
  },
});
