import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppShell from '@/components/app-shell';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'KPI Central',
  description: 'Quản lý và theo dõi các chỉ số hiệu suất chính của bạn một cách hiệu quả.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
