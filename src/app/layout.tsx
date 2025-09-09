import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { DataProvider } from '@/context/data-context';
import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/context/theme-context';
import { ClientLayout } from '@/components/client-layout';

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
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ClientLayout>
              <AuthProvider>
                <DataProvider>
                  {children}
                </DataProvider>
              </AuthProvider>
            </ClientLayout>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
