'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FactoryIcon from '@mui/icons-material/Factory';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getErrorMessage } from '@/lib/utils';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthenticated) {
    router.replace('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setError('Complete los campos obligatorios.');
      return;
    }

    if (!emailPattern.test(email)) {
      setEmailError('El correo debe tener un formato valido');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      router.push('/');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #0d0f1a 0%, #151828 30%, #1a1d3a 50%, #151828 70%, #0d0f1a 100%)'
            : 'linear-gradient(135deg, #f7f8fc 0%, #e8e6f8 30%, #d8d4f0 50%, #e8e6f8 70%, #f7f8fc 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 20s ease infinite',
        }}
      />

      {/* Floating orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '12%',
          width: { xs: 200, md: 350 },
          height: { xs: 200, md: 350 },
          borderRadius: '50%',
          background: mode === 'dark'
            ? 'radial-gradient(circle, rgba(108, 92, 231, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
          filter: 'blur(50px)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: { xs: 160, md: 300 },
          height: { xs: 160, md: 300 },
          borderRadius: '50%',
          background: mode === 'dark'
            ? 'radial-gradient(circle, rgba(0, 206, 201, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 206, 201, 0.12) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse',
          filter: 'blur(50px)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '60%',
          width: { xs: 120, md: 200 },
          height: { xs: 120, md: 200 },
          borderRadius: '50%',
          background: mode === 'dark'
            ? 'radial-gradient(circle, rgba(253, 203, 110, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(253, 203, 110, 0.08) 0%, transparent 70%)',
          animation: 'float 12s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />

      {/* Theme toggle */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 10,
          width: 40,
          height: 40,
          bgcolor: mode === 'dark' ? 'rgba(30, 34, 53, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${mode === 'dark' ? 'rgba(38, 42, 64, 0.6)' : 'rgba(228, 230, 239, 0.8)'}`,
          color: mode === 'light' ? '#1a1d2e' : '#e8eaf0',
          '&:hover': {
            bgcolor: mode === 'dark' ? 'rgba(30, 34, 53, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            transform: 'rotate(180deg)',
          },
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {mode === 'light' ? <DarkModeIcon sx={{ fontSize: '1.1rem' }} /> : <LightModeIcon sx={{ fontSize: '1.1rem' }} />}
      </IconButton>

      {/* Login Card */}
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          position: 'relative',
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
          backdropFilter: 'blur(24px) saturate(200%)',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(21, 24, 40, 0.85) 0%, rgba(21, 24, 40, 0.6) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          border: `1px solid ${mode === 'dark' ? 'rgba(38, 42, 64, 0.6)' : 'rgba(228, 230, 239, 0.8)'}`,
          boxShadow: mode === 'dark'
            ? '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(108, 92, 231, 0.06)'
            : '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 80px rgba(108, 92, 231, 0.04)',
          borderRadius: '18px',
        }}
      >
        <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                boxShadow: '0 8px 24px rgba(108, 92, 231, 0.35)',
                animation: 'float 4s ease-in-out infinite',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(-5deg) scale(1.05)',
                },
              }}
            >
              <FactoryIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #00cec9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.75,
                letterSpacing: '-0.03em',
              }}
            >
              ProduccionApp
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: mode === 'dark' ? '#8b90a8' : '#7c8098',
                textAlign: 'center',
                fontSize: '0.85rem',
                fontWeight: 400,
              }}
            >
              Sistema de Gestion Integral
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '10px',
                animation: 'slideInLeft 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                fontSize: '0.85rem',
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Correo Electronico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              error={!!emailError}
              helperText={emailError}
              margin="normal"
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: mode === 'dark' ? 'rgba(13, 15, 26, 0.4)' : 'rgba(247, 248, 252, 0.6)',
                },
              }}
            />
            <TextField
              fullWidth
              label="Contrasena"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              disabled={isLoading}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: mode === 'dark' ? '#8b90a8' : '#7c8098' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: mode === 'dark' ? 'rgba(13, 15, 26, 0.4)' : 'rgba(247, 248, 252, 0.6)',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                fontSize: '0.9rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient 4s ease infinite',
                boxShadow: '0 6px 20px rgba(108, 92, 231, 0.3)',
                borderRadius: '10px',
                letterSpacing: '-0.01em',
                '&:hover': {
                  boxShadow: '0 8px 28px rgba(108, 92, 231, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Iniciar Sesion'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
