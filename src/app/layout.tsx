import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { DataProvider } from '@/context/data-context';

export const metadata: Metadata = {
  title: 'KPI Central',
  description: 'Quản lý và theo dõi các chỉ số hiệu suất chính của bạn một cách hiệu quả.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
