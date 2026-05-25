'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCountUp } from '@/hooks/useCountUp';
import { empleadosApi, referenciasApi, ordenesApi, liquidacionesApi } from '@/lib/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  link: string;
  delay: number;
}

function StatCard({ title, value, icon, gradient, link, delay }: StatCardProps) {
  const { mode } = useTheme();
  const count = useCountUp(typeof value === 'number' ? value : 0, 800);

  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <Paper
        sx={{
          p: 0,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          animation: `slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
          transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          border: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
          bgcolor: mode === 'dark' ? '#151828' : '#ffffff',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: mode === 'dark'
              ? '0 12px 36px rgba(0, 0, 0, 0.3)'
              : '0 12px 36px rgba(0, 0, 0, 0.08)',
            borderColor: mode === 'dark' ? '#3a3f5c' : '#d0d3e0',
            '& .stat-icon-box': {
              transform: 'scale(1.05)',
            },
            '& .stat-arrow': {
              opacity: 1,
              transform: 'translateX(0)',
            },
          },
        }}
      >
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box
              className="stat-icon-box"
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                boxShadow: `0 4px 12px ${gradient.includes('#6c5ce7') ? 'rgba(108, 92, 231, 0.25)' : gradient.includes('#00cec9') ? 'rgba(0, 206, 201, 0.25)' : gradient.includes('#fdcb6e') ? 'rgba(253, 203, 110, 0.25)' : 'rgba(16, 184, 148, 0.25)'}`,
              }}
            >
              <Box sx={{ color: 'white', display: 'flex', alignItems: 'center', '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }}>
                {icon}
              </Box>
            </Box>
            <Box
              className="stat-arrow"
              sx={{
                opacity: 0,
                transform: 'translateX(-6px)',
                transition: 'all 0.3s ease',
                color: mode === 'dark' ? '#8b90a8' : '#7c8098',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
            </Box>
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: mode === 'dark' ? '#8b90a8' : '#7c8098',
                fontWeight: 500,
                fontSize: '0.78rem',
                letterSpacing: '0.02em',
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: mode === 'dark' ? '#e8eaf0' : '#1a1d2e',
                fontSize: '1.75rem',
                animation: 'countUp 0.5s ease-out',
              }}
            >
              {count}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Link>
  );
}

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  delay: number;
}

function QuickAction({ label, description, icon, link, color, delay }: QuickActionProps) {
  const { mode } = useTheme();

  return (
    <Link href={link} style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: '12px',
          cursor: 'pointer',
          animation: `scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both`,
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          border: `1px solid transparent`,
          '&:hover': {
            bgcolor: mode === 'dark' ? 'rgba(108, 92, 231, 0.06)' : 'rgba(108, 92, 231, 0.03)',
            borderColor: mode === 'dark' ? 'rgba(108, 92, 231, 0.15)' : 'rgba(108, 92, 231, 0.1)',
            transform: 'translateX(4px)',
            '& .action-icon': {
              transform: 'scale(1.1)',
              boxShadow: `0 4px 12px ${color}30`,
            },
          },
        }}
      >
        <Box
          className="action-icon"
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: `${color}12`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            flexShrink: 0,
            '& .MuiSvgIcon-root': { fontSize: '1.15rem' },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.85rem',
              color: mode === 'dark' ? '#e8eaf0' : '#1a1d2e',
              letterSpacing: '-0.01em',
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: mode === 'dark' ? '#8b90a8' : '#7c8098',
              fontSize: '0.72rem',
              fontWeight: 400,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { mode } = useTheme();
  const [counts, setCounts] = useState({ empleados: 0, referencias: 0, ordenes: 0, liquidaciones: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [empRes, refRes, ordRes, liqRes] = await Promise.allSettled([
          empleadosApi.getAll(),
          referenciasApi.getAll(),
          ordenesApi.getAll(),
          liquidacionesApi.getAll(),
        ]);
        setCounts({
          empleados: empRes.status === 'fulfilled' ? (empRes.value.data?.length || 0) : 0,
          referencias: refRes.status === 'fulfilled' ? (refRes.value.data?.length || 0) : 0,
          ordenes: ordRes.status === 'fulfilled' ? (ordRes.value.data?.length || 0) : 0,
          liquidaciones: liqRes.status === 'fulfilled' ? (liqRes.value.data?.length || 0) : 0,
        });
      } catch {
        // Silently fail - counts stay at 0
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const isAdmin = user?.role === 'ADMIN';
  const isRH = user?.role === 'RH';
  const isProduccion = user?.role === 'PRODUCCION';

  const stats = [
    {
      title: 'Empleados',
      value: loading ? '...' : counts.empleados,
      icon: <BadgeIcon />,
      gradient: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
      link: '/empleados',
      show: isAdmin || isRH,
      delay: 0.1,
    },
    {
      title: 'Referencias',
      value: loading ? '...' : counts.referencias,
      icon: <InventoryIcon />,
      gradient: 'linear-gradient(135deg, #00cec9, #55efc4)',
      link: '/referencias',
      show: isAdmin || isProduccion,
      delay: 0.15,
    },
    {
      title: 'Ordenes',
      value: loading ? '...' : counts.ordenes,
      icon: <AssignmentIcon />,
      gradient: 'linear-gradient(135deg, #fdcb6e, #f0b44a)',
      link: '/ordenes',
      show: isAdmin || isProduccion,
      delay: 0.2,
    },
    {
      title: 'Liquidaciones',
      value: loading ? '...' : counts.liquidaciones,
      icon: <PaymentsIcon />,
      gradient: 'linear-gradient(135deg, #00b894, #55efc4)',
      link: '/liquidaciones',
      show: isAdmin || isProduccion,
      delay: 0.25,
    },
  ].filter((stat) => stat.show);

  const quickActions = [
    {
      label: 'Gestionar Empleados',
      description: 'Ver, crear y administrar personal',
      icon: <PeopleIcon />,
      link: '/empleados',
      color: '#6c5ce7',
      show: isAdmin || isRH,
      delay: 0.3,
    },
    {
      label: 'Ver Ordenes',
      description: 'Consultar ordenes de produccion',
      icon: <AssignmentIcon />,
      link: '/ordenes',
      color: '#fdcb6e',
      show: isAdmin || isProduccion,
      delay: 0.35,
    },
    {
      label: 'Registros de Produccion',
      description: 'Control de produccion diaria',
      icon: <AccessTimeIcon />,
      link: '/registros',
      color: '#00cec9',
      show: isAdmin || isProduccion,
      delay: 0.4,
    },
    {
      label: 'Liquidaciones',
      description: 'Calcular y revisar pagos',
      icon: <CheckCircleIcon />,
      link: '/liquidaciones',
      color: '#00b894',
      show: isAdmin || isProduccion,
      delay: 0.45,
    },
  ].filter((action) => action.show);

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Greeting */}
      <Box
        sx={{
          mb: 4,
          animation: 'fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            fontSize: { xs: '1.5rem', md: '1.85rem' },
            letterSpacing: '-0.03em',
          }}
        >
          {getGreeting()},{' '}
          <span className="text-gradient">
            {user?.name?.split(' ')[0] || 'Usuario'}
          </span>
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: mode === 'dark' ? '#8b90a8' : '#7c8098',
            fontSize: '0.9rem',
            fontWeight: 400,
          }}
        >
          Resumen de tu sistema de gestion de produccion
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Bottom section */}
      <Grid container spacing={2.5}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 0,
              animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both',
              border: `1px solid ${mode === 'dark' ? '#262a40' : '#e4e6ef'}`,
              bgcolor: mode === 'dark' ? '#151828' : '#ffffff',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Acciones Rapidas
              </Typography>
            </Box>
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              {quickActions.map((action) => (
                <QuickAction key={action.label} {...action} />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
