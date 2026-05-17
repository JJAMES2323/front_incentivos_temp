'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';
import PaymentsIcon from '@mui/icons-material/Payments';
import FactoryIcon from '@mui/icons-material/Factory';
import { useAuth } from '@/contexts/AuthContext';
import { NavItem, UserRole } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

const DRAWER_WIDTH = 272;

const navItems: NavItem[] = [
  {
    label: 'Inicio',
    path: '/',
    icon: <HomeIcon />,
    roles: ['ADMIN', 'RH', 'PRODUCCION'],
  },
  {
    label: 'Usuarios',
    path: '/usuarios',
    icon: <PeopleIcon />,
    roles: ['ADMIN'],
  },
  {
    label: 'Empleados',
    path: '/empleados',
    icon: <BadgeIcon />,
    roles: ['ADMIN', 'RH'],
  },
  {
    label: 'Referencias',
    path: '/referencias',
    icon: <InventoryIcon />,
    roles: ['ADMIN', 'PRODUCCION'],
  },
  {
    label: 'Ordenes',
    path: '/ordenes',
    icon: <AssignmentIcon />,
    roles: ['ADMIN', 'PRODUCCION'],
  },
  {
    label: 'Registros',
    path: '/registros',
    icon: <DescriptionIcon />,
    roles: ['ADMIN', 'PRODUCCION'],
  },
  {
    label: 'Registros Laborados',
    path: '/logs',
    icon: <HistoryIcon />,
    roles: ['ADMIN', 'PRODUCCION'],
  },
  {
    label: 'Liquidaciones',
    path: '/liquidaciones',
    icon: <PaymentsIcon />,
    roles: ['ADMIN', 'PRODUCCION'],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'temporary';
}

export default function Sidebar({ open, onClose, variant }: SidebarProps) {
  const pathname = usePathname();
  const { hasRole, user } = useAuth();
  const { mode } = useTheme();

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles as UserRole[]));

  const getInitials = (name?: string) => {
    if (!name?.trim()) return 'U';
    return name.split(' ').map((n) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: mode === 'dark' ? '#0d0f1a' : '#ffffff',
        position: 'relative',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2.5,
          borderBottom: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          '&:hover': {
            bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.05)' : 'rgba(108, 92, 231, 0.02)',
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
            flexShrink: 0,
          }}
        >
          <FactoryIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: mode === 'dark' ? '#e8eaf0' : '#1a1d2e',
            }}
          >
            ProduccionApp
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: mode === 'dark' ? '#8b90a8' : '#7c8098',
              fontWeight: 500,
              fontSize: '0.7rem',
              letterSpacing: '0.03em',
            }}
          >
            Sistema de Gestion
          </Typography>
        </Box>
      </Box>
      </Link>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {filteredNavItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <ListItem
              key={item.path}
              disablePadding
              sx={{
                mb: 0.25,
                animation: `slideInLeft 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.04}s both`,
              }}
            >
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  borderRadius: '10px',
                  py: 1.1,
                  px: 1.5,
                  minHeight: 42,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  '&::before': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: '60%',
                        background: 'linear-gradient(180deg, #6c5ce7, #a29bfe)',
                        borderRadius: '0 3px 3px 0',
                      }
                    : {},
                  '&:hover': {
                    bgcolor: mode === 'dark'
                      ? 'rgba(108, 92, 231, 0.08)'
                      : 'rgba(108, 92, 231, 0.05)',
                    transform: 'translateX(2px)',
                  },
                  ...(isActive && {
                    bgcolor: mode === 'dark'
                      ? 'rgba(108, 92, 231, 0.12)'
                      : 'rgba(108, 92, 231, 0.07)',
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isActive
                      ? mode === 'dark' ? '#a78bfa' : '#6c5ce7'
                      : mode === 'dark' ? '#8b90a8' : '#7c8098',
                    transition: 'all 0.3s ease',
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem',
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? mode === 'dark' ? '#e8eaf0' : '#1a1d2e'
                        : mode === 'dark' ? '#8b90a8' : '#7c8098',
                      transition: 'all 0.3s ease',
                      letterSpacing: '-0.01em',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User info */}
      <Box sx={{ px: 2, pb: 2, pt: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: '12px',
            bgcolor: mode === 'dark' ? 'rgba(30, 34, 53, 0.6)' : 'rgba(240, 241, 245, 0.8)',
            border: `1px solid ${mode === 'dark' ? 'rgba(38, 42, 64, 0.6)' : 'rgba(228, 230, 239, 0.8)'}`,
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
              flexShrink: 0,
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: mode === 'dark' ? '#e8eaf0' : '#1a1d2e',
              }}
            >
              {user?.name || 'Usuario'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: mode === 'dark' ? '#8b90a8' : '#7c8098',
                fontSize: '0.68rem',
                fontWeight: 500,
              }}
            >
              {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'RH' ? 'Recursos Humanos' : 'Produccion'}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#00b894',
              flexShrink: 0,
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
          borderRight: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
          boxShadow: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export { DRAWER_WIDTH };
