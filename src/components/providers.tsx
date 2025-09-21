'use client';

import { AuthProvider } from '@/context/auth-context';
import { DataProvider } from '@/context/data-context';
import { LanguageProvider } from '@/context/language-context';
import { ThemeProvider } from '@/context/theme-context';
import { ClientLayout } from '@/components/client-layout';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
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
  );
}