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
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
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

const DRAWER_WIDTH = 280;

const navItems: NavItem[] = [
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
    label: 'Órdenes',
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
  const { hasRole } = useAuth();
  const { mode } = useTheme();

  const filteredNavItems = navItems.filter((item) => hasRole(item.roles as UserRole[]));

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: mode === 'dark'
          ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2.5,
          borderBottom: mode === 'dark'
            ? '1px solid rgba(71, 85, 105, 0.4)'
            : '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(-5deg) scale(1.1)',
            },
          }}
        >
          <FactoryIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Producción
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {filteredNavItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <ListItem
              key={item.path}
              disablePadding
              sx={{
                mb: 0.5,
                animation: `slideInLeft 0.3s ease ${index * 0.05}s both`,
              }}
            >
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  borderRadius: '12px',
                  py: 1.2,
                  px: 1.5,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: 'linear-gradient(180deg, #6366f1, #ec4899)',
                        borderRadius: '0 4px 4px 0',
                      }
                    : {},
                  '&:hover': {
                    bgcolor: mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.1)'
                      : 'rgba(99, 102, 241, 0.08)',
                    transform: 'translateX(4px)',
                    '& .nav-icon': {
                      transform: 'scale(1.15)',
                    },
                    '& .nav-label': {
                      fontWeight: 600,
                    },
                  },
                  ...(isActive && {
                    bgcolor: mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'rgba(99, 102, 241, 0.08)',
                    '& .nav-icon': {
                      color: '#6366f1',
                    },
                    '& .nav-label': {
                      fontWeight: 700,
                      color: mode === 'dark' ? '#818cf8' : '#4f46e5',
                    },
                  }),
                }}
              >
                <ListItemIcon
                  className="nav-icon"
                  sx={{
                    minWidth: 42,
                    color: isActive ? '#6366f1' : 'text.secondary',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  className="nav-label"
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: isActive
                        ? mode === 'dark' ? '#818cf8' : '#4f46e5'
                        : 'text.primary',
                      transition: 'all 0.3s ease',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider
        sx={{
          borderColor: mode === 'dark'
            ? 'rgba(71, 85, 105, 0.4)'
            : 'rgba(226, 232, 240, 0.6)',
        }}
      />
      <Box sx={{ p: 2.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15))'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(236, 72, 153, 0.08))',
            border: mode === 'dark'
              ? '1px solid rgba(99, 102, 241, 0.2)'
              : '1px solid rgba(99, 102, 241, 0.15)',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            Versión 1.0
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            Sistema de Gestión de Producción
          </Typography>
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
          boxShadow: mode === 'dark'
            ? '4px 0 24px rgba(0, 0, 0, 0.3)'
            : '4px 0 24px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export { DRAWER_WIDTH };
