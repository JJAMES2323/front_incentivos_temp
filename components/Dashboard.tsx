'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  shadowColor: string;
  link: string;
  trend?: { value: number; positive: boolean };
  delay: number;
}

function StatCard({ title, value, icon, gradient, shadowColor, link, trend, delay }: StatCardProps) {
  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <Paper
        sx={{
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          animation: `slideUp 0.5s ease ${delay}s both`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 20px 40px ${shadowColor}`,
            '& .stat-icon': {
              transform: 'scale(1.15) rotate(-5deg)',
            },
            '& .stat-arrow': {
              opacity: 1,
              transform: 'translateX(0)',
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: gradient,
            opacity: 0.1,
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Avatar
              className="stat-icon"
              sx={{
                width: 56,
                height: 56,
                background: gradient,
                boxShadow: `0 8px 20px ${shadowColor}`,
                transition: 'all 0.3s ease',
              }}
            >
              {icon}
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>
                {value}
              </Typography>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <TrendingUpIcon
                    sx={{
                      fontSize: 16,
                      color: trend.positive ? '#10b981' : '#ef4444',
                      transform: trend.positive ? 'none' : 'rotate(180deg)',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: trend.positive ? '#10b981' : '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    {trend.value}%
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box
            className="stat-arrow"
            sx={{
              opacity: 0,
              transform: 'translateX(-10px)',
              transition: 'all 0.3s ease',
              color: 'text.secondary',
            }}
          >
            →
          </Box>
        </Box>
      </Paper>
    </Link>
  );
}

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  delay: number;
}

function QuickAction({ label, icon, link, color, delay }: QuickActionProps) {
  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          animation: `scaleIn 0.3s ease ${delay}s both`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(8px)',
            bgcolor: `${color}15`,
            '& .action-icon': {
              transform: 'scale(1.2)',
            },
          },
        }}
      >
        <Box
          className="action-icon"
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            transition: 'all 0.3s ease',
          }}
        >
          {icon}
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Paper>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const isAdmin = user?.role === 'ADMIN';
  const isRH = user?.role === 'RH';
  const isProduccion = user?.role === 'PRODUCCION';

  const stats = [
    {
      title: 'Empleados',
      value: '--',
      icon: <BadgeIcon />,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      shadowColor: 'rgba(99, 102, 241, 0.3)',
      link: '/empleados',
      trend: { value: 12, positive: true },
      show: isAdmin || isRH,
      delay: 0.1,
    },
    {
      title: 'Referencias',
      value: '--',
      icon: <InventoryIcon />,
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      shadowColor: 'rgba(6, 182, 212, 0.3)',
      link: '/referencias',
      trend: { value: 8, positive: true },
      show: isAdmin || isProduccion,
      delay: 0.2,
    },
    {
      title: 'Órdenes',
      value: '--',
      icon: <AssignmentIcon />,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      shadowColor: 'rgba(245, 158, 11, 0.3)',
      link: '/ordenes',
      trend: { value: 5, positive: false },
      show: isAdmin || isProduccion,
      delay: 0.3,
    },
    {
      title: 'Liquidaciones',
      value: '--',
      icon: <PaymentsIcon />,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      shadowColor: 'rgba(16, 185, 129, 0.3)',
      link: '/liquidaciones',
      trend: { value: 15, positive: true },
      show: isAdmin || isProduccion,
      delay: 0.4,
    },
  ].filter((stat) => stat.show);

  const quickActions = [
    {
      label: 'Gestionar Empleados',
      icon: <PeopleIcon />,
      link: '/empleados',
      color: '#6366f1',
      show: isAdmin || isRH,
      delay: 0.3,
    },
    {
      label: 'Ver Órdenes',
      icon: <AssignmentIcon />,
      link: '/ordenes',
      color: '#f59e0b',
      show: isAdmin || isProduccion,
      delay: 0.4,
    },
    {
      label: 'Registros de Producción',
      icon: <AccessTimeIcon />,
      link: '/registros',
      color: '#06b6d4',
      show: isAdmin || isProduccion,
      delay: 0.5,
    },
    {
      label: 'Liquidaciones',
      icon: <CheckCircleIcon />,
      link: '/liquidaciones',
      color: '#10b981',
      show: isAdmin || isProduccion,
      delay: 0.6,
    },
  ].filter((action) => action.show);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 4,
          animation: 'fadeIn 0.5s ease',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 0.5,
          }}
        >
          {getGreeting()},{' '}
          <span className="text-gradient">
            {user?.name?.split(' ')[0] || 'Usuario'}
          </span>
          👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí tienes un resumen de tu sistema de gestión
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 3,
              animation: 'slideUp 0.5s ease 0.3s both',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid size={{ xs: 12, sm: 6 }} key={action.label}>
                  <QuickAction {...action} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              animation: 'slideUp 0.5s ease 0.4s both',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Actividad Reciente
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {[
                { label: 'Usuarios registrados', progress: 0.75, color: '#6366f1' },
                { label: 'Órdenes completadas', progress: 0.6, color: '#f59e0b' },
                { label: 'Liquidaciones del mes', progress: 0.85, color: '#10b981' },
              ].map((item) => (
                <Box key={item.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: item.color }}>
                      {Math.round(item.progress * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.progress * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: `${item.color}20`,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
