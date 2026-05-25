'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedLayout from '@/components/ProtectedLayout';
import Dashboard from '@/components/Dashboard';
import { UserRole } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { mode } = useTheme();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setShowDashboard(true);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const getUserRole = (): UserRole[] => {
    if (!user) return ['ADMIN'];
    return [user.role as UserRole];
  };

  if (isLoading || !isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: mode === 'dark' ? '#0d0f1a' : '#f7f8fc',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 80,
            height: 80,
          }}
        >
          <CircularProgress
            size={80}
            thickness={4}
            sx={{
              color: mode === 'dark' ? '#a78bfa' : '#6c5ce7',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </Box>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 3, fontWeight: 500 }}
        >
          Cargando...
        </Typography>
      </Box>
    );
  }

  return (
    <ProtectedLayout allowedRoles={getUserRole()}>
      {showDashboard && <Dashboard />}
    </ProtectedLayout>
  );
}
