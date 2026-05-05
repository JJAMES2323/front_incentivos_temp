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
  PRODUCCION: 'Producción',
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
    if (!name?.trim()) {
      return 'U';
    }

    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
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
        borderBottom: mode === 'dark'
          ? '1px solid rgba(71, 85, 105, 0.4)'
          : '1px solid rgba(226, 232, 240, 0.6)',
        backdropFilter: 'blur(20px)',
        backgroundColor: mode === 'dark'
          ? 'rgba(15, 23, 42, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 2,
              '&:hover': {
                bgcolor: mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(99, 102, 241, 0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={mode === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  bgcolor: mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(99, 102, 241, 0.1)',
                  transform: 'rotate(180deg)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Cuenta">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{
                '&:hover': {
                  '& .avatar-wrapper': {
                    transform: 'scale(1.1)',
                  },
                },
              }}
            >
              <Box
                className="avatar-wrapper"
                sx={{
                  transition: 'transform 0.3s ease',
                  position: 'relative',
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {user ? getInitials(displayName) : <PersonIcon />}
                </Avatar>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: user ? '#10b981' : '#94a3b8',
                    border: `2px solid ${mode === 'dark' ? '#1e293b' : '#ffffff'}`,
                  }}
                />
              </Box>
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
                minWidth: 220,
                mt: 1.5,
                borderRadius: 3,
                border: mode === 'dark'
                  ? '1px solid rgba(71, 85, 105, 0.4)'
                  : '1px solid rgba(226, 232, 240, 0.6)',
                boxShadow: mode === 'dark'
                  ? '0 20px 50px rgba(0, 0, 0, 0.4)'
                  : '0 20px 50px rgba(0, 0, 0, 0.1)',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  transform: 'translateY(-50%) rotate(45deg)',
                  border: mode === 'dark'
                    ? '1px solid rgba(71, 85, 105, 0.4)'
                    : '1px solid rgba(226, 232, 240, 0.6)',
                  borderRight: 'none',
                  borderBottom: 'none',
                },
              },
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {user?.email || 'Sin correo'}
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                mt: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
                border: mode === 'dark'
                  ? '1px solid rgba(99, 102, 241, 0.3)'
                  : '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#6366f1' }}>
                {user?.role ? roleLabels[user.role] : ''}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.08)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: '#ef4444',
              }}
            >
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ fontWeight: 500 }}>
              Cerrar Sesión
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
