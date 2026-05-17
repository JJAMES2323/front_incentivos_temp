'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedLayout from '@/components/ProtectedLayout';
import Dashboard from '@/components/Dashboard';
import { UserRole } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
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
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #c7d2fe 100%)',
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
              color: '#6366f1',
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
