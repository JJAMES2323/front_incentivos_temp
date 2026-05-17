'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DRAWER_WIDTH } from './Sidebar';

interface HeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  RH: 'Recursos Humanos',
  PRODUCCION: 'Produccion',
};

export default function Header({ onMenuClick, isMobile }: HeaderProps) {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const displayName = user?.name || user?.email || 'Usuario';

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name?.trim()) return 'U';
    return name.split(' ').map((n) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'U';
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'transparent',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
        backdropFilter: 'blur(24px) saturate(200%)',
        backgroundColor: mode === 'dark'
          ? 'rgba(13, 15, 26, 0.78)'
          : 'rgba(247, 248, 252, 0.78)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, md: 3 } }}>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 1.5,
              color: mode === 'dark' ? '#8b90a8' : '#7c8098',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.1)' : 'rgba(108, 92, 231, 0.06)',
                color: mode === 'dark' ? '#a78bfa' : '#6c5ce7',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: '1.3rem' }} />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                width: 36,
                height: 36,
                color: mode === 'dark' ? '#8b90a8' : '#7c8098',
                '&:hover': {
                  bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.1)' : 'rgba(108, 92, 231, 0.06)',
                  color: mode === 'dark' ? '#a78bfa' : '#6c5ce7',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {mode === 'light' ? (
                <DarkModeIcon sx={{ fontSize: '1.15rem' }} />
              ) : (
                <LightModeIcon sx={{ fontSize: '1.15rem' }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Cuenta">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: `2px solid ${mode === 'dark' ? '#151828' : '#ffffff'}`,
                  boxShadow: '0 2px 8px rgba(108, 92, 231, 0.2)',
                }}
              >
                {user ? getInitials(displayName) : <PersonIcon sx={{ fontSize: '0.9rem' }} />}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                minWidth: 240,
                mt: 1.5,
                borderRadius: '14px',
                border: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
                boxShadow: mode === 'dark'
                  ? '0 16px 48px rgba(0, 0, 0, 0.4)'
                  : '0 16px 48px rgba(0, 0, 0, 0.08)',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 16,
                  width: 10,
                  height: 10,
                  bgcolor: mode === 'dark' ? '#151828' : '#ffffff',
                  transform: 'translateY(-50%) rotate(45deg)',
                  border: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
                  borderRight: 'none',
                  borderBottom: 'none',
                },
              },
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {getInitials(displayName)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                  {user?.email || 'Sin correo'}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.25,
                py: 0.5,
                borderRadius: '6px',
                bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.12)' : 'rgba(108, 92, 231, 0.08)',
                border: `1px solid ${mode === 'dark' ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.15)'}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: mode === 'dark' ? '#a78bfa' : '#6c5ce7',
                  fontSize: '0.7rem',
                  letterSpacing: '0.03em',
                }}
              >
                {user?.role ? roleLabels[user.role] : ''}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: mode === 'dark' ? '#262a40' : '#e4e6ef' }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2.5,
              mx: 1,
              my: 0.5,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: mode === 'dark' ? 'rgba(231, 76, 94, 0.1)' : 'rgba(231, 76, 94, 0.06)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#e74c5e', minWidth: 36 }}>
              <LogoutIcon sx={{ fontSize: '1.1rem' }} />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: '#e74c5e' }}>
              Cerrar Sesion
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
