'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import AuthGuard from './AuthGuard';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Header from './Header';
import { UserRole } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const muiTheme = useMuiTheme();
  const { mode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          bgcolor: mode === 'dark' ? '#0d0f1a' : '#f7f8fc',
          position: 'relative',
        }}
      >
        {/* Ambient mesh gradient */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: mode === 'dark' ? 0.6 : 0.4,
            background:
              mode === 'dark'
                ? 'radial-gradient(ellipse at 10% 20%, rgba(108, 92, 231, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(0, 206, 201, 0.05) 0%, transparent 50%)'
                : 'radial-gradient(ellipse at 10% 20%, rgba(108, 92, 231, 0.04) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(0, 206, 201, 0.03) 0%, transparent 50%)',
          }}
        />

        {!isMobile && (
          <Sidebar open={true} onClose={() => {}} variant="permanent" />
        )}

        {isMobile && (
          <Sidebar
            open={mobileOpen}
            onClose={handleDrawerToggle}
            variant="temporary"
          />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'transparent',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Header onMenuClick={handleDrawerToggle} isMobile={isMobile} />

          <Box sx={{ height: 64 }} />

          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2.5,
              flexGrow: 1,
              animation: 'fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
