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
          bgcolor: mode === 'dark' ? '#0f172a' : '#f8fafc',
        }}
      >
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
          }}
        >
          <Header onMenuClick={handleDrawerToggle} isMobile={isMobile} />

          <Box sx={{ height: 72 }} />

          <Box
            sx={{
              p: 3,
              flexGrow: 1,
              animation: 'fadeIn 0.4s ease',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </AuthGuard>
  );
}
