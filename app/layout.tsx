import type { Metadata, Viewport } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ProduccionApp — Sistema de Gestion',
    template: '%s | ProduccionApp',
  },
  description: 'Sistema integral de gestion de produccion, liquidacion de empleados y control de ordenes.',
  generator: 'v0.app',
  keywords: ['produccion', 'gestion', 'liquidacion', 'empleados', 'ordenes'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f1a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <AuthProvider>
              <SnackbarProvider>
                {children}
              </SnackbarProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
